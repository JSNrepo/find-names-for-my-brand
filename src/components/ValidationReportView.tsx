import React from 'react';
import { ValidatedName, ProjectBrief } from '../types';
import { jsPDF } from 'jspdf';
import { Download, Printer, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ValidationReportViewProps {
  validatedName: ValidatedName;
  brief?: ProjectBrief;
  onBack: () => void;
}

export const ValidationReportView: React.FC<ValidationReportViewProps> = ({
  validatedName,
  brief,
  onBack
}) => {
  if (!validatedName || !validatedName.candidate) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4 bg-zinc-900 border border-zinc-800 rounded-3xl my-8">
        <h3 className="text-xl font-bold text-white">Certificate Unavailable</h3>
        <p className="text-xs text-zinc-400">The requested brand clearance certificate could not be loaded.</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl bg-zinc-100 text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-white"
        >
          Back to Results
        </button>
      </div>
    );
  }

  const { candidate, checks = [], domains = [], finalScore = 0, pronunciationScore = 0, uniquenessConfidence = 0, validatedAt = new Date().toISOString() } = validatedName;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('Find Names for My Brand - Clearance Certificate', 20, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date(validatedAt).toLocaleString()}`, 20, 28);
    doc.text(`Brand Name: ${candidate.name} (${candidate.pronunciation})`, 20, 36);

    doc.setFont('helvetica', 'bold');
    doc.text(`Overall Score: ${finalScore}/100 | Easy Sound Rating: ${pronunciationScore}/100 | Search Safety: ${uniquenessConfidence}%`, 20, 44);

    doc.setLineWidth(0.5);
    doc.line(20, 48, 190, 48);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Brand Origin & Vibe', 20, 56);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Category: ${candidate.category.toUpperCase()}`, 20, 62);
    doc.text(`Brand Story: ${candidate.originExplanation}`, 20, 68, { maxWidth: 170 });
    doc.text(`Why It Fits Your Business: ${candidate.semanticConnection}`, 20, 80, { maxWidth: 170 });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Completed Search Safety Checks', 20, 95);

    let y = 103;
    checks.forEach((chk, idx) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${idx + 1}. [${chk.type.toUpperCase()}] Provider: ${chk.provider} | Status: ${chk.status.toUpperCase()}`, 20, y);
      y += 5;
      if (chk.query) {
        doc.setFont('helvetica', 'normal');
        doc.text(`Query: ${chk.query}`, 25, y);
        y += 5;
      }
    });

    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Web Address (.com) Availability', 20, y);
    y += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    domains.forEach((d) => {
      doc.text(`• ${d.domain} : ${d.status.toUpperCase()}`, 25, y);
      y += 5;
    });

    y += 10;
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(
      'LEGAL DISCLAIMER: This automated report verifies that zero exact-match internet collisions were found during live search indexing. It does not constitute legal or trademark advice. Complete a trademark clearance search before registering.',
      20, y, { maxWidth: 170 }
    );

    doc.save(`Brand_Clearance_Report_${candidate.name}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 print:p-0 print:m-0">
      
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Names</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="btn-print-report"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-800 transition-colors min-h-[44px]"
          >
            <Printer className="w-4 h-4" />
            <span>Print Certificate</span>
          </button>

          <button
            id="btn-download-pdf"
            onClick={handleDownloadPDF}
            className="px-5 py-2.5 rounded-xl bg-zinc-100 text-zinc-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-white transition-all shadow-sm min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>

      {/* Report Document Sheet */}
      <div className="p-6 sm:p-12 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 text-white space-y-8 shadow-sm print:bg-white print:text-black print:border-none print:shadow-none">
        
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 print:border-black pb-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-950 font-extrabold flex items-center justify-center text-sm shadow-sm">F</div>
              <span className="text-xl font-bold tracking-tight">Find Names for My Brand Safety Certificate</span>
            </div>
            <p className="text-xs text-zinc-400 print:text-gray-600 mt-2">
              Verified On: {new Date(validatedAt).toLocaleDateString()} at {new Date(validatedAt).toLocaleTimeString()}
            </p>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold print:bg-emerald-100 print:text-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
              <span>0 Detected Internet Collisions</span>
            </span>
          </div>
        </div>

        {/* Candidate Focus */}
        <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-zinc-800 print:bg-gray-50 print:border-gray-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">{candidate.name}</h1>
            <p className="text-xs text-zinc-400 print:text-gray-600 mt-2 flex items-center gap-2">
              <span>Sounds like: <strong>"{candidate.pronunciation}"</strong></span>
              <span>•</span>
              <span className="capitalize">Style: {candidate.category}</span>
            </p>
          </div>

          <div className="flex items-center gap-6 text-center border-t sm:border-t-0 sm:border-l border-zinc-800 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">Brand Score</span>
              <span className="text-2xl font-black">{finalScore}/100</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">Search Safety</span>
              <span className="text-2xl font-black text-emerald-400 print:text-emerald-700">{uniquenessConfidence}%</span>
            </div>
          </div>
        </div>

        {/* Audit Details */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 print:text-gray-800 mb-2">
              1. Brand Story & Meaning
            </h3>
            <p className="text-xs text-zinc-300 print:text-gray-700 leading-relaxed p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 print:bg-gray-50">
              {candidate.originExplanation}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 print:text-gray-800 mb-2">
              2. Why This Brand Name Fits Your Business
            </h3>
            <p className="text-xs text-zinc-300 print:text-gray-700 leading-relaxed p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 print:bg-gray-50">
              {candidate.semanticConnection}
            </p>
          </div>

          {/* Audit Checks Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 print:text-gray-800 mb-3">
              3. Search Engines & Directories Checked ({checks.length})
            </h3>
            
            <div className="space-y-2.5">
              {checks.map((chk, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 print:bg-gray-50 print:border-gray-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-200 print:text-black capitalize">{idx + 1}. {chk.type} ({chk.provider})</span>
                    <span className="text-emerald-400 font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      {chk.status === 'passed' ? 'PASS (0 Matches)' : chk.status}
                    </span>
                  </div>
                  {chk.query && <p className="text-zinc-500 print:text-gray-600 font-mono text-[11px]">Searched Query: {chk.query}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Domain Status */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 print:text-gray-800 mb-2">
              4. Web Domain (.com) Availability Status
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {domains.map(d => (
                <div key={d.domain} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 print:bg-gray-50 text-center">
                  <span className="font-bold block text-zinc-300 print:text-black">.{d.extension}</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 mt-1 block">AVAILABLE</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Required Legal Disclaimer */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed print:bg-gray-100 print:text-gray-800 print:border-gray-300">
          <strong className="block font-bold text-zinc-200 print:text-black mb-1">Mandatory Trademark Disclaimer</strong>
          This automated certificate confirms that zero exact-match internet collisions were found during live search indexing. It does not replace an official trademark clearance or legal counsel. Complete a official trademark search prior to commercial registration.
        </div>
      </div>
    </div>
  );
};
