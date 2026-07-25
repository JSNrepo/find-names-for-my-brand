import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { ProjectBriefSchema, NamingProject, NameRun, ValidatedName, AdminConfig, Candidate } from '../types';
import { getSearchProvider } from './search/search-factory';
import { checkDomains } from './engine/domain-checker';
import { GeminiCandidateGenerator } from './engine/gemini-generator';
import { pronunciationScore, generatePhoneticVariants } from './engine/pronunciation';

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  const projectsMap = new Map<string, NamingProject>();
  const runsMap = new Map<string, NameRun>();

  let adminConfig: AdminConfig = {
    geminiModel: 'gemini-3.6-flash',
    batchSize: 60,
    maxSearchCalls: 100,
    searchProvider: 'auto',
    cacheDurationDays: 7,
    minPronunciationScore: 80,
    strictnessMode: 'extreme',
    dailyUserLimit: 50,
    blockedWords: [],
    blockedBrands: ['google', 'apple', 'microsoft'],
    blockedSuffixes: ['ly', 'ify', 'io', 'ai']
  };

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.get('/api/admin/config', (req, res) => {
    res.json(adminConfig);
  });

  app.post('/api/admin/config', (req, res) => {
    adminConfig = { ...adminConfig, ...req.body };
    res.json({ success: true, config: adminConfig });
  });

  app.post('/api/admin/clear-all', (req, res) => {
    projectsMap.clear();
    runsMap.clear();
    res.json({ success: true, message: 'All in-memory project and run databases cleared fresh.' });
  });

  app.post('/api/projects', (req, res) => {
    try {
      const brief = ProjectBriefSchema.parse(req.body.brief || req.body);
      const id = req.body.id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const userId = req.body.userId || 'guest_user';
      const title = req.body.title || brief.productType || 'New Naming Project';
      const project: NamingProject = {
        id, userId, title, brief,
        status: 'draft',
        savedCandidates: req.body.savedCandidates || [],
        rejectedCandidates: req.body.rejectedCandidates || [],
        searchUsageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      projectsMap.set(id, project);
      res.json(project);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Invalid brief data' });
    }
  });

  app.get('/api/projects', (req, res) => {
    const userId = (req.query.userId as string) || 'guest_user';
    const userProjects = Array.from(projectsMap.values()).filter(p => p.userId === userId || userId === 'all');
    res.json(userProjects);
  });

  app.get('/api/projects/:projectId', (req, res) => {
    const project = projectsMap.get(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  });

  app.put('/api/projects/:projectId', (req, res) => {
    const project = projectsMap.get(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const updated = { ...project, ...req.body, updatedAt: new Date().toISOString() };
    projectsMap.set(req.params.projectId, updated);
    res.json(updated);
  });

  app.delete('/api/projects/:projectId', (req, res) => {
    if (!projectsMap.has(req.params.projectId)) return res.status(404).json({ error: 'Project not found' });
    projectsMap.delete(req.params.projectId);
    res.json({ success: true, message: 'Project deleted' });
  });

  app.post('/api/candidates/generate', async (req, res) => {
    try {
      const brief = ProjectBriefSchema.parse(req.body.brief || req.body);
      const customApiKey = (req.body.userApiKey || req.headers['x-gemini-key'] || req.headers['x-gemini-api-key']) as string | undefined;
      const likedName = req.body.likedName as string | undefined;
      const count = Math.min(req.body.count || 40, 50);

      if (!customApiKey || !customApiKey.trim()) {
        return res.status(400).json({
          error: 'BYOK Required'
        });
      }

      const generator = new GeminiCandidateGenerator(customApiKey);
      let candidates: Candidate[];
      if (likedName) {
        candidates = await generator.generateSimilarCandidates(likedName, brief, count);
      } else {
        candidates = await generator.generateCandidates(brief, count);
      }

      candidates = candidates.filter(c => {
        const lower = c.name.toLowerCase();
        if (lower.length < brief.minimumLetters || lower.length > brief.maximumLetters) return false;
        if (brief.avoidTerms.some(t => t.length >= 2 && lower.includes(t.toLowerCase()))) return false;
        if (pronunciationScore(c.name) < 80) return false;
        return true;
      });

      res.json({ candidates });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to generate candidates' });
    }
  });

  app.post('/api/candidates/validate', async (req, res) => {
    try {
      const { name, brief, strictnessMode } = req.body;
      const userApiKey = (req.headers['x-gemini-key'] || req.headers['x-gemini-api-key']) as string | undefined;
      const validatedBrief = ProjectBriefSchema.parse(brief || {});
      const mode = strictnessMode || 'extreme';
      const provider = getSearchProvider(adminConfig.searchProvider, userApiKey);
      const checks: any[] = [];
      let hasCollision = false;

      const exactResult = await provider.exactSearch(name, mode);
      checks.push({
        type: 'exact-search',
        status: exactResult.hasCollision ? 'collision' : 'passed',
        query: exactResult.query,
        totalResults: exactResult.totalResults,
        evidence: exactResult.evidence,
        checkedAt: new Date().toISOString(),
        provider: exactResult.provider
      });
      if (exactResult.hasCollision) hasCollision = true;

      if (!hasCollision && validatedBrief.checkSoftware) {
        const ctx = await provider.contextualSearch(name, 'software', mode);
        checks.push({ type: 'software-search', status: ctx.hasCollision ? 'collision' : 'passed', query: ctx.query, totalResults: ctx.totalResults, evidence: ctx.evidence, checkedAt: new Date().toISOString(), provider: ctx.provider });
        if (ctx.hasCollision) hasCollision = true;
      }
      if (!hasCollision && validatedBrief.checkCompany) {
        const ctx = await provider.contextualSearch(name, 'company', mode);
        checks.push({ type: 'company-search', status: ctx.hasCollision ? 'collision' : 'passed', query: ctx.query, totalResults: ctx.totalResults, evidence: ctx.evidence, checkedAt: new Date().toISOString(), provider: ctx.provider });
        if (ctx.hasCollision) hasCollision = true;
      }
      if (!hasCollision && validatedBrief.checkApp) {
        const ctx = await provider.contextualSearch(name, 'app', mode);
        checks.push({ type: 'app-search', status: ctx.hasCollision ? 'collision' : 'passed', query: ctx.query, totalResults: ctx.totalResults, evidence: ctx.evidence, checkedAt: new Date().toISOString(), provider: ctx.provider });
        if (ctx.hasCollision) hasCollision = true;
      }

      let domains: any[] = [];
      if (!hasCollision && validatedBrief.checkDomains) {
        domains = await checkDomains(name);
      }

      res.json({ name, checks, domains, hasCollision });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/candidates/similar', async (req, res) => {
    try {
      const { name, brief, userApiKey } = req.body;
      const customApiKey = (userApiKey || req.headers['x-gemini-api-key']) as string | undefined;
      const validatedBrief = ProjectBriefSchema.parse(brief);
      const generator = new GeminiCandidateGenerator(customApiKey);
      const candidates = await generator.generateSimilarCandidates(name, validatedBrief, 10);
      res.json(candidates);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/search/exact', async (req, res) => {
    try {
      const { candidateName, strictnessMode } = req.body;
      const userApiKey = (req.headers['x-gemini-key'] || req.headers['x-gemini-api-key']) as string | undefined;
      const provider = getSearchProvider(adminConfig.searchProvider, userApiKey);
      const result = await provider.exactSearch(candidateName, strictnessMode || 'extreme');
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/search/context', async (req, res) => {
    try {
      const { candidateName, context, strictnessMode } = req.body;
      const provider = getSearchProvider(adminConfig.searchProvider);
      const result = await provider.contextualSearch(candidateName, context, strictnessMode || 'extreme');
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/domains/check', async (req, res) => {
    try {
      const { candidateName } = req.body;
      const results = await checkDomains(candidateName);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/assistant/chat', async (req, res) => {
    try {
      const { messages, currentBrief, userApiKey } = req.body;
      const key = (userApiKey || req.headers['x-gemini-key'] || req.headers['x-gemini-api-key']) as string | undefined;
      if (!key || !key.trim()) {
        return res.status(400).json({ error: 'BYOK Required: Please supply your free Gemini API key in Settings.' });
      }

      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const conversationHistory = messages.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
      const prompt = `You are Brand Naming Assistant, an expert AI brand strategist for "Find Names for My Brand".
Help the user clarify their business idea, target market, product features, and brand personality so they can fill their brand brief accurately.

CURRENT BRIEF STATE:
${JSON.stringify(currentBrief || {})}

CONVERSATION HISTORY:
${conversationHistory}

Provide a helpful, friendly, concise response. If appropriate, suggest specific brief updates in JSON format at the end of your response like:
\`\`\`json
{
  "suggestedBriefUpdates": {
    "productType": "...",
    "personality": ["modern", "trustworthy"],
    "meanings": ["readiness", "progress"]
  }
}
\`\`\``;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt
      });

      res.json({ text: response.text });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return app;
}
