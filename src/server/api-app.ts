import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { ProjectBriefSchema, NamingProject, NameRun, ValidatedName, AdminConfig } from '../types';
import { PipelineRunner } from './engine/pipeline';
import { getSearchProvider } from './search/search-factory';
import { checkDomains } from './engine/domain-checker';
import { GeminiCandidateGenerator } from './engine/gemini-generator';

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  const projectsMap = new Map<string, NamingProject>();
  const runsMap = new Map<string, NameRun>();
  const activePipelines = new Map<string, PipelineRunner>();
  const activeStreams = new Map<string, express.Response[]>();

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

  // Healthcheck
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Admin Config
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
    activePipelines.clear();
    activeStreams.clear();
    res.json({ success: true, message: 'All in-memory project and run databases cleared fresh.' });
  });

  // Projects Endpoints
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

  // Name Runs Pipeline
  app.post('/api/name-runs', async (req, res) => {
    try {
      const brief = ProjectBriefSchema.parse(req.body.brief);
      const projectId = req.body.projectId || `proj_${Date.now()}`;
      const userId = req.body.userId || 'guest_user';
      const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const targetCount = req.body.targetCount || brief.targetCount || 10;
      const likedName = req.body.likedName as string | undefined;
      const customApiKey = (req.body.userApiKey || req.headers['x-gemini-key'] || req.headers['x-gemini-api-key']) as string | undefined;

      if (!customApiKey || !customApiKey.trim()) {
        return res.status(400).json({
          error: 'BYOK Required: Find Names for My Brand is open-source and operates strictly on Bring Your Own Key (BYOK). Please enter your free Gemini API key in Settings or the key prompt.'
        });
      }

      const initialRun: NameRun = {
        id: runId, projectId, userId, status: 'running', targetCount,
        stats: { generatedCount: 0, pronunciationFilteredCount: 0, localFilteredCount: 0, searchedCount: 0, collisionsFoundCount: 0, passedCount: 0, currentStage: 'Initializing pipeline' },
        validatedNames: [],
        logs: [{ timestamp: new Date().toISOString(), message: 'Pipeline initialized', type: 'info' }],
        createdAt: new Date().toISOString()
      };

      runsMap.set(runId, initialRun);

      const runner = new PipelineRunner(brief, adminConfig.searchProvider, customApiKey);
      activePipelines.set(runId, runner);

      runner.runPipeline(targetCount, (stats, newLog, validatedName) => {
        const run = runsMap.get(runId);
        if (run) {
          run.stats = stats;
          if (newLog) run.logs.push(newLog);
          if (validatedName) run.validatedNames.push(validatedName);
        }
        const resList = activeStreams.get(runId);
        if (resList) {
          const eventData = JSON.stringify({ stats, newLog, validatedName });
          resList.forEach(resStream => { resStream.write(`data: ${eventData}\n\n`); });
        }
      }, likedName).then((results) => {
        const run = runsMap.get(runId);
        if (run) {
          run.status = runner['isCancelled'] ? 'cancelled' : 'completed';
          run.completedAt = new Date().toISOString();
          run.validatedNames = results;
        }
        const proj = projectsMap.get(projectId);
        if (proj) {
          proj.status = 'completed';
          proj.savedCandidates = results;
          proj.updatedAt = new Date().toISOString();
        }
        const resList = activeStreams.get(runId);
        if (resList) {
          resList.forEach(resStream => {
            resStream.write(`data: ${JSON.stringify({ finished: true, results })}\n\n`);
            resStream.end();
          });
          activeStreams.delete(runId);
        }
        activePipelines.delete(runId);
      }).catch(err => {
        console.error('Pipeline execution error:', err);
        const run = runsMap.get(runId);
        if (run) {
          run.status = 'failed';
          run.logs.push({ timestamp: new Date().toISOString(), message: `Failed: ${err.message}`, type: 'error' });
        }
        activePipelines.delete(runId);
      });

      res.json(initialRun);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to start name run' });
    }
  });

  app.get('/api/name-runs/:runId', (req, res) => {
    const run = runsMap.get(req.params.runId);
    if (!run) return res.status(404).json({ error: 'Run not found' });
    res.json(run);
  });

  app.get('/api/name-runs/:runId/stream', (req, res) => {
    const runId = req.params.runId;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (!activeStreams.has(runId)) activeStreams.set(runId, []);
    activeStreams.get(runId)!.push(res);

    const run = runsMap.get(runId);
    if (run) {
      res.write(`data: ${JSON.stringify({ stats: run.stats, logs: run.logs, validatedNames: run.validatedNames })}\n\n`);
    }

    req.on('close', () => {
      const list = activeStreams.get(runId);
      if (list) activeStreams.set(runId, list.filter(r => r !== res));
    });
  });

  app.post('/api/name-runs/:runId/cancel', (req, res) => {
    const runner = activePipelines.get(req.params.runId);
    if (runner) runner.cancel();
    const run = runsMap.get(req.params.runId);
    if (run) run.status = 'cancelled';
    res.json({ success: true, message: 'Run cancelled' });
  });

  // Single candidate actions
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
      const provider = getSearchProvider(adminConfig.searchProvider);
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

  // Guided Assistant Chat
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
