        const STANDARD_LEGAL_DISCLAIMER = "This AI analysis is for informational purposes, scenario-specific, and requires review by a qualified Argon Law legal professional. Ensure all language uses Australian English spelling (e.g. 'analyse', 'colour'). Maintain a highly professional and objective tone. When analysing scenarios, do not invent weaknesses or risks if the document adequately addresses the scenario. Provide a fair and balanced assessment. If the document is strong against a scenario, state that clearly.";
        const AI_PROFESSIONAL_TONE_AU_SPELLING = "Ensure all language uses Australian English spelling (e.g. 'analyse', 'colour'). Maintain a highly professional and objective tone.";
        const AI_FAIRNESS_GUIDANCE = "When identifying strengths, weaknesses, or making recommendations, if a specific clause number or section title from the document is directly relevant, please state it (e.g. 'As per Clause 3.1, ...' or 'Section X on Termination indicates...'). Do not invent weaknesses or risks if the document adequately addresses the scenario; if so, state 'No specific weaknesses identified for this scenario.' Similarly for strengths, if none are standout, state 'No specific standout strengths for this scenario.' Provide a fair and balanced assessment.";

        if (typeof pdfjsLib !== 'undefined') { pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';} else { console.error("pdf.js library not loaded!");}
        
        let documentTextContent = null; 
        let allRunsRawData = []; 
        let fullConsolidatedReportData = {};
        let rawRevisedMarkdownContent = ""; // For storing raw Markdown from AI revision
        let userStopRequested = false; // Flag for stopping stress test

        let fileInput, fileInfoDiv, areaOfPracticeSelect, scenariosTextarea, progressLogDiv, loadingMessageP, stressTestButton, btnSpinner, btnText, errorDisplayDiv, resultsPanelDiv, loadingIndicatorDiv, defaultScenarioPlaceholder, analysisStagesSelect, runsPerStageSelect, audExchangeRateInput, usageStatsPanelDiv, downloadJsonReportBtn, downloadPdfReportBtn, numScenariosToGenerateInput, suggestScenariosBtn, suggestBtnSpinner, suggestBtnText, executiveSummaryContentDiv, scenarioGenCostDisplayP, rankingCostDisplayP, executiveSummaryCostDisplayP, revisedDocumentPanelDiv, generateRevisedDocBtn, revisedDocBtnSpinner, revisedDocBtnText, revisedDocLoadingIndicator, revisedDocLoadingMessageP, revisedDocDisplayDiv, downloadRevisedTxtBtn, downloadRevisedPdfBtn, revisedDocCostDisplayP, copyRevisedDocBtn, otherAreaOfPracticeGroupDiv, otherAreaOfPracticeTextInput, stopStressTestBtn, toggleDetailedAnalysisBtn, perScenarioResultsContainerDiv, apiModelSelect, revisionApiModelSelect;

        // MODIFIED: Updated pricing for o3 and o4-mini
        const modelPricingUSD_per_1M_Tokens = { 
            "gpt-4.1": { input: 2.00, output: 8.00, displayName: "gpt-4.1" }, 
            "gpt-4.1-mini": { input: 0.40, output: 1.60, displayName: "gpt-4.1-mini" }, 
            "gpt-4.1-nano": { input: 0.10, output: 0.40, displayName: "gpt-4.1-nano" }, 
            "o3-2025-04-16": { input: 10.00, output: 40.00, displayName: "o3 (Opus)" }, 
            "o4-mini-2025-04-16": { input: 1.10, output: 4.40, displayName: "o4-mini (Haiku)" } 
        };
        const suggestedScenarios = { "Commercial & Business Law": ["What if a counterparty breaches a key term of the agreement?", "What if there's an unexpected change in market conditions affecting the business (e.g. supply chain disruption, significant cost increase)?", "What if a key person within one of the parties leaves or becomes incapacitated?", "What if new regulations are introduced that impact the business operations covered by the agreement?", "What if a dispute arises regarding the interpretation of a critical clause?"], "Property Law": ["What if defects are discovered in the property post-settlement (for sale contracts)?","What if a tenant defaults on rent or breaches lease conditions (for leases)?","What if zoning laws change, affecting the intended use of the property?","What if there's an undisclosed encumbrance or easement on the title?","What if damage occurs to the property between contract and settlement?"], "Employment Law": ["What if an employee makes a claim for unfair dismissal or discrimination?","What if confidential information is leaked by a current or former employee?","What if there's a significant workplace health and safety incident?","What if changes to Modern Awards or legislation require contract updates?","What if an employee performance issue needs to be managed or results in termination?"], "Litigation & Dispute Resolution": ["What if key evidence becomes inadmissible or a key witness is unavailable?","What if the opposing party proposes an unexpectedly low settlement offer?","What if the dispute escalates and requires urgent injunctive relief?","What if the client's financial situation changes, impacting their ability to fund the litigation?","What if new case law emerges that impacts the strength of our client's position?"], "Wills & Estates": ["What if a major beneficiary predeceases the testator?","What if the will is challenged by a disgruntled family member (e.g. family provision claim)?","What if the executor is unwilling or unable to act?","What if the nature or value of estate assets changes significantly between will drafting and death?","What if there are ambiguities in the will leading to interpretation disputes?"], "Mergers & Acquisitions": ["What if due diligence reveals undisclosed liabilities in the target company?","What if regulatory approval for the transaction is delayed or denied?","What if key employees of the target company resign post-acquisition?","What if warranties provided in the sale agreement are breached post-completion?","What if financing for the acquisition falls through?"] };
        
        document.addEventListener('DOMContentLoaded', () => {
            // Assign all DOM elements
            fileInput=document.getElementById('docFile'); fileInfoDiv=document.getElementById('fileInfo'); 
            areaOfPracticeSelect=document.getElementById('areaOfPractice'); 
            scenariosTextarea=document.getElementById('scenarios'); 
            progressLogDiv=document.getElementById('progressLog'); 
            loadingMessageP=document.getElementById('loadingMessage'); 
            stressTestButton=document.getElementById('stressTestBtn'); 
            btnSpinner=document.getElementById('btnSpinner'); btnText=document.getElementById('btnText'); 
            errorDisplayDiv=document.getElementById('errorDisplay'); 
            resultsPanelDiv=document.getElementById('resultsPanel'); 
            loadingIndicatorDiv=document.getElementById('loadingIndicator'); 
            analysisStagesSelect=document.getElementById('analysisStages'); 
            runsPerStageSelect=document.getElementById('runsPerStage'); 
            audExchangeRateInput=document.getElementById('audExchangeRate'); 
            usageStatsPanelDiv=document.getElementById('usageStatsPanel'); 
            downloadJsonReportBtn=document.getElementById('downloadJsonReportBtn'); 
            downloadPdfReportBtn=document.getElementById('downloadPdfReportBtn'); 
            numScenariosToGenerateInput=document.getElementById('numScenariosToGenerate'); 
            suggestScenariosBtn=document.getElementById('suggestScenariosBtn'); 
            suggestBtnSpinner=document.getElementById('suggestBtnSpinner'); 
            suggestBtnText=document.getElementById('suggestBtnText'); 
            executiveSummaryContentDiv=document.getElementById('executiveSummaryContent'); 
            scenarioGenCostDisplayP=document.getElementById('scenarioGenCostDisplay'); 
            rankingCostDisplayP = document.getElementById('rankingCostDisplay'); 
            executiveSummaryCostDisplayP=document.getElementById('executiveSummaryCostDisplay');
            revisedDocumentPanelDiv = document.getElementById('revisedDocumentPanel');
            generateRevisedDocBtn = document.getElementById('generateRevisedDocBtn');
            revisedDocBtnSpinner = document.getElementById('revisedDocBtnSpinner');
            revisedDocBtnText = document.getElementById('revisedDocBtnText');
            revisedDocLoadingIndicator = document.getElementById('revisedDocLoadingIndicator');
            revisedDocLoadingMessageP = document.getElementById('revisedDocLoadingMessage');
            revisedDocDisplayDiv = document.getElementById('revisedDocDisplay'); // MODIFIED: Was revisedDocTextarea
            downloadRevisedTxtBtn = document.getElementById('downloadRevisedTxtBtn');
            downloadRevisedPdfBtn = document.getElementById('downloadRevisedPdfBtn');
            revisedDocCostDisplayP = document.getElementById('revisedDocCostDisplay');
            copyRevisedDocBtn = document.getElementById('copyRevisedDocBtn');
            otherAreaOfPracticeGroupDiv = document.getElementById('otherAreaOfPracticeGroup');
            otherAreaOfPracticeTextInput = document.getElementById('otherAreaOfPracticeText');
            stopStressTestBtn = document.getElementById('stopStressTestBtn');
            toggleDetailedAnalysisBtn = document.getElementById('toggleDetailedAnalysisBtn');
            perScenarioResultsContainerDiv = document.getElementById('perScenarioResultsContainer');
            apiModelSelect = document.getElementById('apiModel');
            revisionApiModelSelect = document.getElementById('revisionApiModel');

            populateModelSelectWithOptions(apiModelSelect, "gpt-4.1-nano");
            populateModelSelectWithOptions(revisionApiModelSelect, "o4-mini-2025-04-16");

            if (scenariosTextarea) defaultScenarioPlaceholder = scenariosTextarea.placeholder; else console.error("Scenarios textarea ('scenarios') not found!");
            if(fileInput) fileInput.addEventListener('change', handleFileSelect); 
            if(areaOfPracticeSelect) areaOfPracticeSelect.addEventListener('change', handleAreaOfPracticeChange);
            if (areaOfPracticeSelect && areaOfPracticeSelect.value) handleAreaOfPracticeChange(); 
            
            if(toggleDetailedAnalysisBtn && perScenarioResultsContainerDiv) {
                toggleDetailedAnalysisBtn.addEventListener('click', () => {
                    const isHidden = perScenarioResultsContainerDiv.style.display === 'none';
                    perScenarioResultsContainerDiv.style.display = isHidden ? 'block' : 'none';
                    toggleDetailedAnalysisBtn.textContent = isHidden ? 'Hide Details' : 'Show Details';
                });
            }
        });

        function populateModelSelectWithOptions(selectElement, defaultValueKey) {
            if (!selectElement) return;
            selectElement.innerHTML = ''; // Clear existing options
            for (const modelKey in modelPricingUSD_per_1M_Tokens) {
                const modelInfo = modelPricingUSD_per_1M_Tokens[modelKey];
                const option = document.createElement('option');
                option.value = modelKey;
                let pricingText = `(Input: $${modelInfo.input.toFixed(2)}/MTok; Output: $${modelInfo.output.toFixed(2)}/MTok)`;
                option.innerHTML = `${modelInfo.displayName} <span class="model-pricing-info">${pricingText}</span>`;
                if (modelKey === defaultValueKey) {
                    option.selected = true;
                }
                selectElement.appendChild(option);
            }
        }
        
        function handleAreaOfPracticeChange() {
            const selectedArea = areaOfPracticeSelect.value;
            if (selectedArea === "Other") {
                if(otherAreaOfPracticeGroupDiv) otherAreaOfPracticeGroupDiv.style.display = 'block';
            } else {
                if(otherAreaOfPracticeGroupDiv) otherAreaOfPracticeGroupDiv.style.display = 'none';
                if(otherAreaOfPracticeTextInput) otherAreaOfPracticeTextInput.value = ''; // Clear if not "Other"
            }
            populateSuggestedScenarios(); // This function already exists and handles scenario suggestions
        }

        function getSelectedAreaOfPractice() {
            const selectedValue = areaOfPracticeSelect.value;
            if (selectedValue === "Other") {
                return otherAreaOfPracticeTextInput.value.trim() || "Other (Not specified)";
            }
            return selectedValue;
        }

        function logProgress(message) { if(progressLogDiv){ const p = document.createElement('p'); p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`; progressLogDiv.appendChild(p); progressLogDiv.scrollTop = progressLogDiv.scrollHeight; } else { console.log(`Progress (UI Log N/A): ${message}`); }}
        function clearProgressLog() { if(progressLogDiv) progressLogDiv.innerHTML = '';}
        function clearScenarios() { if(scenariosTextarea) { scenariosTextarea.value = ''; if (defaultScenarioPlaceholder) { scenariosTextarea.placeholder = defaultScenarioPlaceholder; } } console.log("Scenarios cleared by user.");}
        function populateSuggestedScenarios() { if (!areaOfPracticeSelect || !scenariosTextarea || defaultScenarioPlaceholder === undefined) { console.warn("populateSuggestedScenarios: Required elements not found or placeholder not set."); return; } const selectedArea = areaOfPracticeSelect.value; const currentScenariosValue = scenariosTextarea.value; let shouldPopulate = false; if (suggestedScenarios[selectedArea]) { const newSuggestedSet = suggestedScenarios[selectedArea].join('\n'); if (currentScenariosValue.trim() === '' || currentScenariosValue === defaultScenarioPlaceholder) { shouldPopulate = true; } else { for (const key in suggestedScenarios) { if (key !== selectedArea && suggestedScenarios[key].join('\n') === currentScenariosValue) { shouldPopulate = true; break; } } } if (shouldPopulate) scenariosTextarea.value = newSuggestedSet; } else if (selectedArea === "Other" || selectedArea === "") { let isCurrentContentFromSuggestions = false; for (const key in suggestedScenarios) { if (suggestedScenarios[key].join('\n') === currentScenariosValue) { isCurrentContentFromSuggestions = true; break; } } if (isCurrentContentFromSuggestions || currentScenariosValue === defaultScenarioPlaceholder) { scenariosTextarea.value = ''; scenariosTextarea.placeholder = defaultScenarioPlaceholder; } } }
        function handleFileSelect(event) { const file = event.target.files[0]; if (file) { if(fileInfoDiv) fileInfoDiv.textContent = `Selected file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`; documentTextContent = null; showLoading(true, "Reading file..."); logProgress("File selected. Reading content..."); readFileContent(file); } else { if(fileInfoDiv) fileInfoDiv.textContent = 'No file selected.'; documentTextContent = null; } }
        function readFileContent(file) { const reader = new FileReader(); const fileType = file.name.split('.').pop().toLowerCase(); reader.onerror = () => { const errorMsg = "Error reading file."; displayError(errorMsg); logProgress(errorMsg); console.error("FileReader error:", reader.error); showLoading(false); }; if (fileType === 'pdf') { reader.onload = async (e) => { try { logProgress("Extracting text from PDF..."); if (typeof pdfjsLib === 'undefined') { logProgress("pdf.js lib not loaded."); displayError("PDF lib not loaded."); showLoading(false); return; } const pdf = await pdfjsLib.getDocument({ data: e.target.result }).promise; let text = ''; for (let i = 1; i <= pdf.numPages; i++) { const page = await pdf.getPage(i); const content = await page.getTextContent(); text += content.items.map(item => item.str).join(' ') + '\\n'; } documentTextContent = text; if(fileInfoDiv) fileInfoDiv.textContent += ' - Ready.'; logProgress("PDF extracted."); showLoading(false); } catch (error) { console.error('PDF Error:', error); displayError('PDF Error: ' + error.message); logProgress(`PDF Error: ${error.message}`); documentTextContent = null; showLoading(false); } }; reader.readAsArrayBuffer(file); } else if (fileType === 'docx') { reader.onload = (e) => { logProgress("Extracting text from DOCX..."); if (typeof mammoth !== 'undefined') { mammoth.extractRawText({ arrayBuffer: e.target.result }).then(result => { documentTextContent = result.value; if(fileInfoDiv) fileInfoDiv.textContent += ' - Ready.'; logProgress("DOCX extracted."); showLoading(false); }).catch(error => { console.error('DOCX Error:', error); displayError('DOCX Error: ' + error.message); logProgress(`DOCX Error: ${error.message}`); documentTextContent = null; showLoading(false); }); } else { const errorMsg = "Mammoth.js not loaded."; displayError(errorMsg); logProgress(errorMsg); showLoading(false); } }; reader.readAsArrayBuffer(file); } else if (fileType === 'txt') {  reader.onload = (e) => { logProgress("Reading TXT..."); documentTextContent = e.target.result; if(fileInfoDiv) fileInfoDiv.textContent += ' - Ready.'; logProgress("TXT read."); showLoading(false); }; reader.readAsText(file); } else { const msg = 'Unsupported file type.'; displayError(msg); logProgress(msg); documentTextContent = null; showLoading(false); return; } }
        function splitIntoSentences(text, maxLength = 250) { if (!text) return []; const sentences = text.match(/[^.!?]+[.!?]\s*|[^.!?]+$/g) || [text]; return sentences.map(s => s.trim()).filter(s => s.length > 0 && s.length <= maxLength); }

        async function generateScenariosWithAI(existingScenarios = []) {
            logProgress("AI Scenario Suggestion Initiated.");
            hideError();
            if(suggestScenariosBtn) { suggestScenariosBtn.disabled = true; if(suggestBtnSpinner) suggestBtnSpinner.style.display = 'inline-block'; if(suggestBtnText) suggestBtnText.textContent = 'Generating...';}

            const apiKey = document.getElementById('apiKey').value.trim();
            const model = apiModelSelect.value; // Use main model for this
            const areaOfPractice = getSelectedAreaOfPractice();
            const numScenariosToGenerateTotal = parseInt(numScenariosToGenerateInput.value) || 5;
            const numNeededNow = numScenariosToGenerateTotal - existingScenarios.length;

            if (numNeededNow <= 0) {
                logProgress("Sufficient scenarios already generated or provided.");
                if(suggestScenariosBtn) { suggestScenariosBtn.disabled = false; if(suggestBtnSpinner) suggestBtnSpinner.style.display = 'none'; if(suggestBtnText) suggestBtnText.textContent = 'Suggest with AI';}
                scenariosTextarea.value = existingScenarios.slice(0, numScenariosToGenerateTotal).join('\n');
                return;
            }

            if (!apiKey) { displayError('API Key is required to suggest scenarios.'); logProgress("Scenario Suggestion Error: API Key missing."); if(suggestScenariosBtn) { suggestScenariosBtn.disabled = false; if(suggestBtnSpinner) suggestBtnSpinner.style.display = 'none'; if(suggestBtnText) suggestBtnText.textContent = 'Suggest with AI';} return; }
            if (!documentTextContent) { displayError('Please upload a document first for relevant scenario suggestions.'); logProgress("Scenario Suggestion Error: Document content missing."); if(suggestScenariosBtn) { suggestScenariosBtn.disabled = false; if(suggestBtnSpinner) suggestBtnSpinner.style.display = 'none'; if(suggestBtnText) suggestBtnText.textContent = 'Suggest with AI';} return; }

            const docSnippetForScenarioGen = documentTextContent.substring(0, 8000) + (documentTextContent.length > 8000 ? "\n...[DOCUMENT SNIPPET FOR SCENARIO GENERATION]..." : "");
            logProgress(`Using document snippet (up to 8000 chars) for scenario generation. Requesting ${numNeededNow} more scenarios.`);

            let system_prompt_scenario_gen = `You are an AI assistant tasked with generating relevant stress-test scenarios for a legal document. Focus on the document type, its apparent purpose (based on the snippet), and the specified Area of Practice. Provide exactly ${numNeededNow} distinct, plausible, and challenging scenarios. Each scenario MUST be on a new line. Do not include numbering, bullet points, or any other introductory/concluding text. Only the scenarios, one per line. ${AI_PROFESSIONAL_TONE_AU_SPELLING}`;
            let user_prompt_scenario_gen = `DOCUMENT SNIPPET:\n---\n${docSnippetForScenarioGen}\n---\nAREA OF PRACTICE (if specified, otherwise assume general commercial): ${areaOfPractice || 'General Commercial'}\n---\n`;

            if (existingScenarios.length > 0) {
                user_prompt_scenario_gen += `You have already identified the following scenarios:\n${existingScenarios.join('\n')}\n---\nPlease generate ${numNeededNow} *additional and different* stress-test scenarios. Output each new scenario on a new line. No extra formatting.`;
            } else {
                user_prompt_scenario_gen += `Please generate ${numNeededNow} diverse and insightful stress-test scenarios suitable for the above document and area of practice. Output each scenario on a new line. No extra formatting.`;
            }
            
            let scenarioGenInputTokens = 0; let scenarioGenOutputTokens = 0;
            try {
                const requestBody = { model: model, messages: [ { role: "system", content: system_prompt_scenario_gen }, { role: "user", content: user_prompt_scenario_gen } ], temperature: 1, max_tokens: numNeededNow * 70 };
                const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`}, body: JSON.stringify(requestBody) });
                logProgress(`Scenario Gen API responded with status: ${response.status}`);
                
                const data = await response.json();
                if (data.usage) { scenarioGenInputTokens = data.usage.prompt_tokens || 0; scenarioGenOutputTokens = data.usage.completion_tokens || 0; logProgress(`Scenario Gen Token Usage (Attempt): Input=${scenarioGenInputTokens}, Output=${scenarioGenOutputTokens}`);}

                if (!response.ok) { const errorText = data.error ? data.error.message : await response.text(); throw new Error(`API Error (${response.status}): ${errorText}`);}
                if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) { throw new Error("Scenario Gen API response format error: No content."); }
                
                let aiGeneratedScenariosText = data.choices[0].message.content.trim();
                let newScenariosArray = aiGeneratedScenariosText.split('\n').map(s => s.trim()).filter(s => s.length > 0);

                if (newScenariosArray.length === 1 && numNeededNow > 1 && newScenariosArray[0].includes('.')) {
                    logProgress("AI returned a single line for multiple scenarios; attempting sentence split.");
                    const sentences = splitIntoSentences(newScenariosArray[0]);
                    if (sentences.length >= numNeededNow) {
                        newScenariosArray = sentences.slice(0, numNeededNow);
                        logProgress(`Split into ${newScenariosArray.length} sentences as scenarios.`);
                    } else if (sentences.length > 0) {
                         newScenariosArray = sentences;
                         logProgress(`Split into ${newScenariosArray.length} sentences, less than needed.`);
                    }
                }
                
                const combinedScenarios = [...existingScenarios, ...newScenariosArray];
                const uniqueCombinedScenarios = [...new Set(combinedScenarios)];

                scenariosTextarea.value = uniqueCombinedScenarios.slice(0, numScenariosToGenerateTotal).join('\n');
                logProgress(`${uniqueCombinedScenarios.length} total unique scenarios now available. Target was ${numScenariosToGenerateTotal}.`);

                let currentCostText = scenarioGenCostDisplayP.textContent || "";
                let cumulativeInput = scenarioGenInputTokens;
                let cumulativeOutput = scenarioGenOutputTokens;
                if (currentCostText.includes("Tokens:")) { 
                    const match = currentCostText.match(/Tokens: (\d+) In \/ (\d+) Out/);
                    if (match) {
                        cumulativeInput += parseInt(match[1]);
                        cumulativeOutput += parseInt(match[2]);
                    }
                }
                calculateAndDisplaySingleCallCost(cumulativeInput, cumulativeOutput, model, scenarioGenCostDisplayP, "Scenario Suggestion (Cumulative)");

                if (uniqueCombinedScenarios.length < numScenariosToGenerateTotal && existingScenarios.length !== uniqueCombinedScenarios.length && newScenariosArray.length > 0) { 
                    logProgress("Still need more scenarios, making a recursive call.");
                    await generateScenariosWithAI(uniqueCombinedScenarios); 
                }

            } catch (error) { logProgress(`Scenario Generation FAILED: ${error.message}`); displayError('Error suggesting scenarios: ' + error.message); console.error("Error generating scenarios:", error);
            } finally { if(suggestScenariosBtn) { suggestScenariosBtn.disabled = false; if(suggestBtnSpinner) suggestBtnSpinner.style.display = 'none'; if(suggestBtnText) suggestBtnText.textContent = 'Suggest with AI';}}
        }

        async function stressTestDocument() {
            logProgress("Stress test function initiated.");
            userStopRequested = false; // Reset stop flag
            if(stopStressTestBtn) stopStressTestBtn.style.display = 'inline-block';
            if(stressTestButton) stressTestButton.disabled = true;


            allRunsRawData = []; fullConsolidatedReportData = {}; hideError();
            
            resultsPanelDiv.style.display = 'none'; 
            usageStatsPanelDiv.style.display = 'none'; 
            downloadJsonReportBtn.style.display = 'none';
            downloadPdfReportBtn.style.display = 'none';
            if (revisedDocumentPanelDiv) revisedDocumentPanelDiv.style.display = 'none';

            clearProgressLog(); 
            if(executiveSummaryContentDiv) executiveSummaryContentDiv.innerHTML = "<p><em>Processing scenarios... Executive summary will be generated after all analyses.</em></p>";
            
            const costDisplayIds = ['scenarioGenCostDisplayP', 'rankingCostDisplayP', 'executiveSummaryCostDisplayP', 'revisedDocCostDisplayP'];
            costDisplayIds.forEach(id => {
                const el = document.getElementById(id.replace('P','')); 
                if (el) el.textContent = ""; else console.warn(`Cost display element ${id} not found`);
            });
            
            const perScenarioContainer = document.getElementById('perScenarioResultsContainer'); if(perScenarioContainer) perScenarioContainer.innerHTML = '';

            const apiKey = document.getElementById('apiKey').value.trim(); 
            const model = apiModelSelect.value; 
            const scenariosList = scenariosTextarea.value.trim().split('\n').filter(s => s.trim() !== ''); 
            const areaOfPractice = getSelectedAreaOfPractice(); 
            const numAnalysisStages = parseInt(analysisStagesSelect.value) || 1;
            const numRunsPerStageSetting = parseInt(runsPerStageSelect.value) || 1;

            if (!apiKey || !documentTextContent || scenariosList.length === 0) { 
                displayError('API Key, Document, and Scenarios are required.'); 
                logProgress("Validation Error: Missing inputs."); 
                if(stopStressTestBtn) stopStressTestBtn.style.display = 'none';
                if(stressTestButton) stressTestButton.disabled = false;
                return; 
            }

            const totalApiCallsToMake = scenariosList.length * numAnalysisStages * numRunsPerStageSetting;
            showLoading(true, `Preparing ${totalApiCallsToMake} AI analysis API calls (Stage-Gated)...`);
            let totalAnalysisInputTokens = 0; let totalAnalysisOutputTokens = 0;
            const processedDocText = documentTextContent; 
            logProgress(`Using full document text (${documentTextContent.length} chars). ${numAnalysisStages} stage(s), ${numRunsPerStageSetting} run(s) per stage for each scenario.`);
            
            let scenarioProcessingState = {};
            scenariosList.forEach(scen => {
                scenarioProcessingState[scen] = { 
                    originalScenario: scen, 
                    stages: [],
                    currentStageInputJsonForNext: null 
                };
            });

            try { // Added try block for cleanup with finally
                for (let currentStageNum = 1; currentStageNum <= numAnalysisStages; currentStageNum++) {
                    if (userStopRequested) {
                        logProgress(`--- USER REQUESTED STOP at start of Stage ${currentStageNum}. Aborting further processing. ---`);
                        loadingMessageP.textContent = "Process stopped by user.";
                        break; 
                    }

                    let currentStageType = (currentStageNum === 1) ? "Base Analysis" : `QA Stage ${currentStageNum - 1}`;
                    logProgress(`--- Starting Processing for STAGE ${currentStageNum} (${currentStageType}) across ALL scenarios ---`);
                    loadingMessageP.textContent = `Processing Stage ${currentStageNum}/${numAnalysisStages} (${currentStageType}) for ${scenariosList.length} scenarios...`;

                    const allApiPromisesForThisStage = [];

                    for (const scenario of scenariosList) {
                        const scenarioState = scenarioProcessingState[scenario];
                        const inputJsonForThisScenarioStage = (currentStageNum > 1) ? scenarioState.currentStageInputJsonForNext : null;

                        if (currentStageNum > 1 && !inputJsonForThisScenarioStage) {
                            logProgress(`  Scenario "${scenario.substring(0,30)}..." - Skipping ${currentStageType} as previous stage input is missing.`);
                            scenarioState.stages.push({
                                stageNum: currentStageNum, stageType: currentStageType,
                                consolidatedOutput: { error: `Skipped ${currentStageType} due to missing input from previous stage.` },
                                individualRunsData: Array.from({length: numRunsPerStageSetting}, (_, i) => ({run: i + 1, error: "Skipped run"}))
                            });
                            for(let runIdx = 1; runIdx <= numRunsPerStageSetting; runIdx++) {
                                allRunsRawData.push({ scenario: scenario, stage: currentStageNum, stageType: currentStageType, run: runIdx, error: "Skipped run due to missing/failed input from previous stage.", usage: null });
                            }
                            continue; 
                        }

                        for (let runNumInStage = 1; runNumInStage <= numRunsPerStageSetting; runNumInStage++) {
                            let system_prompt_stage, user_prompt_stage_content;
                            let temperature_stage = (currentStageType === "Base Analysis") ? 0.4 : 0.2;

                            if (currentStageType === "Base Analysis") {
                                system_prompt_stage = `You are an expert AI legal assistant for Argon Law. Analyse the provided document against the *specific scenario* below. Area of Practice: ${areaOfPractice || 'General Commercial Matters'}. Focus solely on the implications of THIS SCENARIO for the document. ${AI_FAIRNESS_GUIDANCE} ${AI_PROFESSIONAL_TONE_AU_SPELLING}`;
                                user_prompt_stage_content = `DOCUMENT TEXT:\n---\n${processedDocText}\n---\nCURRENT SCENARIO TO ANALYSE:\n---\n${scenario}\n---\nProvide your analysis for THIS SCENARIO strictly in the following JSON format. Do not include any text outside this JSON structure:\n{\n  "scenario_analyzed": "${escapeJsonString(scenario)}",\n  "analysis_stage_type": "${currentStageType}",\n  "run_number_in_stage": ${runNumInStage},\n  "assessment_for_scenario": { "summary": "Brief (1-3 sentences) qualitative assessment against THIS SPECIFIC SCENARIO. Mention relevant clause numbers if applicable.", "strengths_for_scenario": ["Identify 1-2 key strengths relevant to THIS SCENARIO. Refer to specific clauses/sections if possible. If none standout, state 'No specific standout strengths identified for this scenario.'"], "weaknesses_for_scenario": ["Identify 1-2 key weaknesses/risks exposed by THIS SCENARIO. Refer to specific clauses/sections if possible. If none, state 'No specific weaknesses identified for this scenario.'"] },\n  "recommendations_for_scenario": [ { "recommendation_id": "SCENARIO${scenariosList.indexOf(scenario)+1}-STAGE${currentStageNum}-RUN${runNumInStage}-REC1", "recommendation_text": "Specific, actionable recommendation relevant to THIS SCENARIO. Refer to specific clauses/sections if possible.", "rationale": "Brief rationale for this recommendation related to THIS SCENARIO." } ],\n  "robustness_score_for_scenario": { "score": "Integer score (1-10) for document's robustness against THIS SCENARIO.", "justification": "Brief justification for this score related to THIS SCENARIO." },\n  "disclaimer_note": "${STANDARD_LEGAL_DISCLAIMER}"\n}`;
                            } else { 
                                system_prompt_stage = `You are an expert AI legal QA specialist for Argon Law. You will be given a legal document, a scenario, and an *AI's analysis from a previous stage* (JSON format). Your task is to critically review that previous AI's analysis. Identify any potential hallucinations, inaccuracies, areas lacking clarity, missed points, or deviations from required professional tone or Australian English spelling. Then, provide an *improved and refined JSON analysis* based on your review. Ensure your output adheres to the specified JSON format. ${AI_FAIRNESS_GUIDANCE} ${AI_PROFESSIONAL_TONE_AU_SPELLING}`;
                                user_prompt_stage_content = `DOCUMENT TEXT:\n---\n${processedDocText}\n---\nCURRENT SCENARIO TO ANALYSE:\n---\n${scenario}\n---\nPREVIOUS STAGE AI ANALYSIS (JSON TO REVIEW AND REFINE):\n---\n${inputJsonForThisScenarioStage}\n---\nBased on your critical review of the PREVIOUS STAGE AI ANALYSIS, provide an updated and refined analysis in the *exact same JSON format* as the original, incorporating your improvements. Pay attention to accuracy, clause referencing, professional tone, Australian English, and ensuring weaknesses/strengths are fairly identified:\n{\n  "scenario_analyzed": "${escapeJsonString(scenario)}",\n  "analysis_stage_type": "${currentStageType}",\n  "run_number_in_stage": ${runNumInStage},\n  "assessment_for_scenario": { /* ... same structure ... */ },\n  "recommendations_for_scenario": [ { /* ... same structure ... */ } ],\n  "robustness_score_for_scenario": { /* ... same structure ... */ },\n  "disclaimer_note": "${STANDARD_LEGAL_DISCLAIMER}"\n}`;
                            }
                            const requestBody = { model: model, messages: [ { role: "system", content: system_prompt_stage }, { role: "user", content: user_prompt_stage_content } ], response_format: { type: "json_object" }, temperature: temperature_stage };
                            const apiCallPromise = fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`}, body: JSON.stringify(requestBody) })
                                .then(response => response.json().then(data => ({ ok: response.ok, status: response.status, data: data, scenario: scenario, stageNum: currentStageNum, stageType: currentStageType, runNum: runNumInStage })))
                                .catch(networkError => ({ ok: false, status: 'network_error', data: { error: { message: networkError.message } }, scenario: scenario, stageNum: currentStageNum, stageType: currentStageType, runNum: runNumInStage }));
                            allApiPromisesForThisStage.push(apiCallPromise);
                        } 
                    } 

                    logProgress(`  Waiting for ${allApiPromisesForThisStage.length} API calls for Stage ${currentStageNum} to settle...`);
                    const settledStageApiResults = await Promise.all(allApiPromisesForThisStage);
                    logProgress(`  All ${allApiPromisesForThisStage.length} API calls for Stage ${currentStageNum} have settled.`);

                    if (userStopRequested) { // Check again after awaits
                        logProgress(`--- USER REQUESTED STOP during Stage ${currentStageNum}. Aborting further processing. ---`);
                        loadingMessageP.textContent = "Process stopped by user.";
                        break; 
                    }

                    const stageResultsByScenario = {};
                    settledStageApiResults.forEach(settledResult => {
                        const { scenario } = settledResult;
                        if (!stageResultsByScenario[scenario]) stageResultsByScenario[scenario] = [];
                        stageResultsByScenario[scenario].push(settledResult);
                    });

                    for (const scenario of scenariosList) {
                        const scenarioRunsForThisStage = stageResultsByScenario[scenario] || [];
                        const scenarioState = scenarioProcessingState[scenario];
                        
                        if (scenarioRunsForThisStage.length === 0 && currentStageNum > 1 && scenarioState.stages.find(s => s.stageNum === currentStageNum && s.consolidatedOutput?.error?.includes("Skipped"))) {
                             logProgress(`  Scenario "${scenario.substring(0,30)}..." - Confirmed skip for ${currentStageType}.`);
                            continue; 
                        }
                        
                        const successfulRunsDataForScenarioStage = [];
                        const individualRunsDetailsForDisplay = [];

                        scenarioRunsForThisStage.forEach(settledResult => {
                            const { ok, status, data, scenario: s, stageNum: sN, stageType: sT, runNum: rN } = settledResult;
                            let runUsage = data.usage || null;
                            if (runUsage) { totalAnalysisInputTokens += runUsage.prompt_tokens || 0; totalAnalysisOutputTokens += runUsage.completion_tokens || 0; }
                            
                            const runDetailEntry = { run: rN, error: null, raw_content: null, parsed_response: null };

                            if (ok && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
                                runDetailEntry.raw_content = data.choices[0].message.content;
                                try {
                                    const parsedContent = JSON.parse(data.choices[0].message.content);
                                    successfulRunsDataForScenarioStage.push(parsedContent);
                                    runDetailEntry.parsed_response = parsedContent;
                                    allRunsRawData.push({ scenario: s, stage: sN, stageType: sT, run: rN, raw_response: data.choices[0].message.content, parsed_response: parsedContent, usage: runUsage });
                                    logProgress(`    Scenario "${s.substring(0,20)}..." Run ${rN} for ${sT} SUCCEEDED.`);
                                } catch (parseError) {
                                    runDetailEntry.error = `JSON Parse Error: ${parseError.message}`;
                                    logProgress(`    Scenario "${s.substring(0,20)}..." Run ${rN} for ${sT} FAILED (JSON Parse): ${parseError.message}`);
                                    allRunsRawData.push({ scenario: s, stage: sN, stageType: sT, run: rN, error: `JSON Parse Error: ${parseError.message}`, raw_content: data.choices[0].message.content, usage: runUsage });
                                }
                            } else {
                                runDetailEntry.error = data.error ? data.error.message : `API Error (${status}) or malformed response.`;
                                logProgress(`    Scenario "${s.substring(0,20)}..." Run ${rN} for ${sT} FAILED: ${runDetailEntry.error}`);
                                allRunsRawData.push({ scenario: s, stage: sN, stageType: sT, run: rN, error: runDetailEntry.error, usage: runUsage });
                            }
                            individualRunsDetailsForDisplay.push(runDetailEntry);
                        });
                        
                        const existingStageEntry = scenarioState.stages.find(st => st.stageNum === currentStageNum);
                        if (existingStageEntry && existingStageEntry.consolidatedOutput?.error?.includes("Skipped")) {
                            // Skip
                        } else {
                            const consolidatedOutputForScenarioStage = consolidateStageResults(successfulRunsDataForScenarioStage, currentStageType);
                            scenarioState.stages.push({
                                stageNum: currentStageNum, stageType: currentStageType,
                                consolidatedOutput: consolidatedOutputForScenarioStage,
                                individualRunsData: individualRunsDetailsForDisplay 
                            });
                            if (consolidatedOutputForScenarioStage && !consolidatedOutputForScenarioStage.error) {
                                scenarioState.currentStageInputJsonForNext = JSON.stringify(consolidatedOutputForScenarioStage);
                            } else {
                                scenarioState.currentStageInputJsonForNext = null; 
                                logProgress(`    Scenario "${scenario.substring(0,30)}..." - ${currentStageType} resulted in no usable consolidated output.`);
                            }
                        }
                    } 
                } 

                if (userStopRequested) {
                    logProgress("--- STRESS TEST STOPPED BY USER. Final results may be incomplete. ---");
                } else {
                    logProgress("--- All analysis STAGES complete. Consolidating final results... ---");
                    loadingMessageP.textContent = `Consolidating final results...`;
                }
                
                let finalConsolidatedData = aggregateFinalResults(scenarioProcessingState); 
                
                if (!userStopRequested && finalConsolidatedData.weaknesses.length > 0) {
                    logProgress("Ranking consolidated weaknesses with AI...");
                    loadingMessageP.textContent = `Ranking weaknesses...`;
                    try {
                        const { rankedItems, usage } = await rankItemsAI(finalConsolidatedData.weaknesses, "weakness", apiKey, model);
                        finalConsolidatedData.weaknesses = rankedItems; 
                        if (usage) { 
                            totalAnalysisInputTokens += usage.input || 0; // Counting ranking as part of analysis cost here
                            totalAnalysisOutputTokens += usage.output || 0;
                            calculateAndDisplaySingleCallCost(usage.input || 0, usage.output || 0, model, rankingCostDisplayP, "Consolidated List Ranking (Weaknesses)");
                        }
                        document.getElementById('consolidatedWeaknessesList').innerHTML = rankedItems.map(w => `<li>${escapeHtml(w)}</li>`).join('');
                        logProgress("Weaknesses ranked.");
                    } catch (e) { logProgress(`Error ranking weaknesses: ${e.message}`); displayError(`Could not rank weaknesses: ${e.message}`);}
                }
                if (!userStopRequested && finalConsolidatedData.recommendations.length > 0) {
                    logProgress("Ranking consolidated recommendations with AI...");
                    loadingMessageP.textContent = `Ranking recommendations...`;
                    try {
                        const recTexts = finalConsolidatedData.recommendations.map(r => r.text);
                        const { rankedItems, usage } = await rankItemsAI(recTexts, "recommendation", apiKey, model);
                        finalConsolidatedData.recommendations = rankedItems.map(text => ({ text: text, rationale: finalConsolidatedData.recommendations.find(r=>r.text===text)?.rationale || "" }));
                         if (usage) { 
                            totalAnalysisInputTokens += usage.input || 0; // Counting ranking as part of analysis cost here
                            totalAnalysisOutputTokens += usage.output || 0;
                            let existingRankingCostP = document.getElementById('rankingCostDisplay');
                            let currentText = existingRankingCostP.textContent;
                            if (currentText.includes("Weaknesses")) { // Append if weaknesses already displayed
                                calculateAndDisplaySingleCallCost(usage.input || 0, usage.output || 0, model, document.createElement('p'), "Consolidated List Ranking (Recommendations)", true); // Append to usage panel
                            } else {
                                calculateAndDisplaySingleCallCost(usage.input || 0, usage.output || 0, model, rankingCostDisplayP, "Consolidated List Ranking (Recommendations)");
                            }
                        }
                        document.getElementById('consolidatedRecommendationsList').innerHTML = finalConsolidatedData.recommendations.map(r => `<li>${escapeHtml(r.text)} ${r.rationale ? `<em>(${escapeHtml(r.rationale)})</em>` : ''}</li>`).join('');
                        logProgress("Recommendations ranked.");
                    } catch (e) { logProgress(`Error ranking recommendations: ${e.message}`); displayError(`Could not rank recommendations: ${e.message}`);}
                }
                
                displayAggregatedAndDetailedResults_V8_StageGated(scenarioProcessingState, finalConsolidatedData);
                calculateAndDisplayMainCosts(totalAnalysisInputTokens, totalAnalysisOutputTokens, model);
                fullConsolidatedReportData = { ...finalConsolidatedData }; 
                
                if (!userStopRequested && executiveSummaryContentDiv) {
                    await generateExecutiveSummary(finalConsolidatedData, apiKey, model, areaOfPractice);
                }

                if(downloadJsonReportBtn) downloadJsonReportBtn.style.display = 'inline-block';
                if(downloadPdfReportBtn) downloadPdfReportBtn.style.display = 'inline-block';
                if(revisedDocumentPanelDiv && finalConsolidatedData.recommendations.length > 0) revisedDocumentPanelDiv.style.display = 'block';

            } catch (error) {
                logProgress(`ERROR during stress test: ${error.message}`);
                displayError(`An unexpected error occurred: ${error.message}`);
                console.error("Stress Test Error:", error);
            } finally {
                 showLoading(false); // This also handles stressTestButton re-enable
                 if(stopStressTestBtn) stopStressTestBtn.style.display = 'none';
                 userStopRequested = false; // Ensure reset
                 if (stressTestButton && stressTestButton.disabled) stressTestButton.disabled = false; // Redundant with showLoading but safe
            }
        }
        
        function requestStopProcess() {
            userStopRequested = true;
            logProgress("USER INITIATED STOP. Process will halt after current stage operations complete.");
            if(stopStressTestBtn) stopStressTestBtn.disabled = true; // Prevent multiple clicks
            if(loadingMessageP) loadingMessageP.textContent = "Stop requested. Finishing current operations...";
        }


        function consolidateStageResults(successfulRunsForStage, stageType) { 
            if (!successfulRunsForStage || successfulRunsForStage.length === 0) {
                return { error: "No successful runs in this stage to consolidate." };
            }
            let consolidatedSummary = "";
            const allStrengths = [], allWeaknesses = [], allRecommendations = [], allScores = [];
            successfulRunsForStage.forEach(runData => {
                if (runData.assessment_for_scenario) {
                    if (runData.assessment_for_scenario.summary && !consolidatedSummary) consolidatedSummary = runData.assessment_for_scenario.summary;
                    (runData.assessment_for_scenario.strengths_for_scenario || []).forEach(s => { if(s && s.toLowerCase() !== 'no specific standout strengths identified for this scenario.' && s.toLowerCase() !== 'n/a') allStrengths.push(s); });
                    (runData.assessment_for_scenario.weaknesses_for_scenario || []).forEach(w => { if(w && w.toLowerCase() !== 'no specific weaknesses identified for this scenario.' && w.toLowerCase() !== 'n/a') allWeaknesses.push(w); });
                }
                (runData.recommendations_for_scenario || []).forEach(rec => { if(rec.recommendation_text) allRecommendations.push({ text: rec.recommendation_text, rationale: rec.rationale }); });
                if (runData.robustness_score_for_scenario && runData.robustness_score_for_scenario.score !== undefined) { const scoreVal = parseInt(runData.robustness_score_for_scenario.score); if (!isNaN(scoreVal)) allScores.push(scoreVal); }
            });
            const uniqueStrengths = [...new Set(allStrengths)];
            const uniqueWeaknesses = [...new Set(allWeaknesses)];
            const uniqueRecsTexts = new Set();
            const uniqueRecommendations = allRecommendations.filter(rec => { const isDuplicate = uniqueRecsTexts.has(rec.text); uniqueRecsTexts.add(rec.text); return !isDuplicate; }).map((rec, idx) => ({ recommendation_id: `CONSOLIDATED-${stageType.replace(/\s+/g, '')}-REC${idx+1}`, recommendation_text: rec.text, rationale: rec.rationale }));
            let averageScore = null, scoreJustification = "Average of successful runs in stage.";
            if (allScores.length > 0) averageScore = (allScores.reduce((sum, val) => sum + val, 0) / allScores.length).toFixed(1);
            else if (successfulRunsForStage.length > 0 && successfulRunsForStage[0].robustness_score_for_scenario) { scoreJustification = successfulRunsForStage[0].robustness_score_for_scenario.justification || "Justification from first run."; averageScore = successfulRunsForStage[0].robustness_score_for_scenario.score || "N/A"; }
            return { analysis_stage_type: `Consolidated ${stageType}`, assessment_for_scenario: { summary: consolidatedSummary || "No summary available from successful runs.", strengths_for_scenario: uniqueStrengths.length > 0 ? uniqueStrengths : ["No distinct strengths identified in this stage."], weaknesses_for_scenario: uniqueWeaknesses.length > 0 ? uniqueWeaknesses : ["No distinct weaknesses identified in this stage."] }, recommendations_for_scenario: uniqueRecommendations.length > 0 ? uniqueRecommendations : [{ recommendation_id: `CONSOLIDATED-${stageType.replace(/\s+/g, '')}-NOREC`, recommendation_text:"No specific recommendations consolidated for this stage.", rationale:""}], robustness_score_for_scenario: { score: averageScore !== null ? String(averageScore) : "N/A", justification: scoreJustification }, disclaimer_note: STANDARD_LEGAL_DISCLAIMER };
        }
        
        function aggregateFinalResults(scenarioProcessingState) { 
            const finalStrengths = [], finalWeaknesses = [], finalRecommendations = [], finalScores = [];
            Object.values(scenarioProcessingState).forEach(scenarioData => {
                const lastSuccessfulStageData = scenarioData.stages?.slice().reverse().find(stage => stage.consolidatedOutput && !stage.consolidatedOutput.error);
                if (lastSuccessfulStageData?.consolidatedOutput) {
                    const output = lastSuccessfulStageData.consolidatedOutput;
                    (output.assessment_for_scenario?.strengths_for_scenario || []).forEach(s => { if(s && s.toLowerCase() !== 'no distinct strengths identified in this stage.' && s.toLowerCase() !== 'no specific standout strengths identified for this scenario.' && s.toLowerCase() !== 'n/a') finalStrengths.push(s); });
                    (output.assessment_for_scenario?.weaknesses_for_scenario || []).forEach(w => { if(w && w.toLowerCase() !== 'no distinct weaknesses identified in this stage.' && w.toLowerCase() !== 'no specific weaknesses identified for this scenario.' && w.toLowerCase() !== 'n/a') finalWeaknesses.push(w); });
                    (output.recommendations_for_scenario || []).forEach(rec => { if(rec.recommendation_text && rec.recommendation_text.toLowerCase() !== 'no specific recommendations consolidated for this stage.') finalRecommendations.push({ text: rec.recommendation_text, rationale: rec.rationale }); });
                    if (output.robustness_score_for_scenario?.score) { const scoreVal = parseFloat(output.robustness_score_for_scenario.score); if (!isNaN(scoreVal)) finalScores.push(scoreVal); }
                } else { logProgress(`Scenario "${scenarioData.originalScenario}" had no successful final stage output for aggregation.`); }
            });
            const uniqueStrengths = [...new Set(finalStrengths)];
            const uniqueWeaknesses = [...new Set(finalWeaknesses)];
            const uniqueRecsTexts = new Set();
            const uniqueRecommendations = finalRecommendations.filter(rec => { const isDuplicate = uniqueRecsTexts.has(rec.text); uniqueRecsTexts.add(rec.text); return !isDuplicate; });
            let averageOverallScore = "N/A"; if (finalScores.length > 0) averageOverallScore = (finalScores.reduce((sum, val) => sum + val, 0) / finalScores.length).toFixed(1);
            return { strengths: uniqueStrengths, weaknesses: uniqueWeaknesses, recommendations: uniqueRecommendations, averageScore: averageOverallScore };
        }

        function displayAggregatedAndDetailedResults_V8_StageGated(scenarioProcessingState, finalConsolidatedData) { 
            if (!resultsPanelDiv) return {};
            resultsPanelDiv.style.display = 'block';
            const perScenarioContainer = perScenarioResultsContainerDiv; // Use the stored div
            if(perScenarioContainer) perScenarioContainer.innerHTML = '';
            const consStrengthsUl = document.getElementById('consolidatedStrengthsList'); if (consStrengthsUl) consStrengthsUl.innerHTML = finalConsolidatedData.strengths.length > 0 ? finalConsolidatedData.strengths.map(s => `<li>${escapeHtml(s)}</li>`).join('') : '<li>No distinct strengths identified.</li>';
            const consWeaknessesUl = document.getElementById('consolidatedWeaknessesList'); if (consWeaknessesUl) consWeaknessesUl.innerHTML = finalConsolidatedData.weaknesses.length > 0 ? finalConsolidatedData.weaknesses.map(w => `<li>${escapeHtml(w)}</li>`).join('') + '' : '<li>No distinct weaknesses/risks.</li>'; // Will be repopulated if ranking happens
            const consRecsUl = document.getElementById('consolidatedRecommendationsList'); if (consRecsUl) consRecsUl.innerHTML = finalConsolidatedData.recommendations.length > 0 ? finalConsolidatedData.recommendations.map(r => `<li>${escapeHtml(r.text)} ${r.rationale ? `<em>(${escapeHtml(r.rationale)})</em>` : ''}</li>`).join('') + '' : '<li>No distinct recommendations.</li>'; // Will be repopulated if ranking happens
            const avgScoreSpan = document.getElementById('averageScoreValue'); const consolidatedScoreDiv = document.getElementById('consolidatedScore'); if (avgScoreSpan && consolidatedScoreDiv) { avgScoreSpan.textContent = finalConsolidatedData.averageScore; consolidatedScoreDiv.style.display = 'block'; }
            
            Object.values(scenarioProcessingState).forEach(scenarioData => {
                const scenarioDiv = document.createElement('div'); scenarioDiv.className = 'results-section'; scenarioDiv.innerHTML = `<h3>Scenario: "${escapeHtml(scenarioData.originalScenario)}"</h3>`;
                scenarioData.stages.forEach(stageData => { 
                    const stageDiv = document.createElement('div'); stageDiv.className = 'per-stage-results'; stageDiv.innerHTML = `<h4>${escapeHtml(stageData.stageType)} (Stage ${stageData.stageNum})</h4>`;
                    if (stageData.consolidatedOutput) {
                        if (stageData.consolidatedOutput.error) stageDiv.innerHTML += `<p style="color:var(--argon-error-color)"><strong>Consolidated Stage Error:</strong> ${escapeHtml(stageData.consolidatedOutput.error)}</p>`;
                        else { const c = stageData.consolidatedOutput; stageDiv.innerHTML += `<div style="border:1px solid var(--argon-green-accent);padding:8px;margin-bottom:10px;"><strong>Consolidated:</strong> <p>Summary: ${escapeHtml(c.assessment_for_scenario?.summary)}</p><p>Strengths:<ul>${(c.assessment_for_scenario?.strengths_for_scenario || []).map(s => `<li>${escapeHtml(s)}</li>`).join('')||'<li>N/A</li>'}</ul></p><p>Weaknesses:<ul>${(c.assessment_for_scenario?.weaknesses_for_scenario || []).map(w => `<li>${escapeHtml(w)}</li>`).join('')||'<li>N/A</li>'}</ul></p><p>Recs:<ul>${(c.recommendations_for_scenario || []).map(r => `<li>${escapeHtml(r.recommendation_text)} (${escapeHtml(r.rationale)})</li>`).join('')||'<li>N/A</li>'}</ul></p><p>Score: ${escapeHtml(c.robustness_score_for_scenario?.score)}/10 <em>(${escapeHtml(c.robustness_score_for_scenario?.justification)})</em></p></div>`; }
                    } else stageDiv.innerHTML += `<p>No consolidated output for this stage.</p>`;
                    if (stageData.individualRunsData?.length > 0) {
                        stageDiv.innerHTML += `<p><strong>Individual Runs:</strong></p>`;
                        stageData.individualRunsData.forEach(run => { 
                            const runDiv = document.createElement('div'); runDiv.className = 'per-stage-run'; runDiv.innerHTML = `<h5>Run ${run.run}</h5>`; 
                            if (run.error) runDiv.innerHTML += `<p style="color:var(--argon-error-color);">Error: ${escapeHtml(run.error)}</p>${run.raw_content ? `<p>Raw: <pre>${escapeHtml(String(run.raw_content).substring(0,100))}...</pre></p>`:''}`;
                            else if (run.parsed_response) { const pr = run.parsed_response; runDiv.innerHTML += `<p>Summary: ${escapeHtml(pr.assessment_for_scenario?.summary)}</p><p>Score: ${escapeHtml(pr.robustness_score_for_scenario?.score)}/10</p>`; }
                            else runDiv.innerHTML += `<p>No parsed response for this run.</p>`;
                            stageDiv.appendChild(runDiv);
                        });
                    } scenarioDiv.appendChild(stageDiv);
                }); if (perScenarioContainer) perScenarioContainer.appendChild(scenarioDiv);
            });
        }

        async function rankItemsAI(itemsArray, itemType, apiKey, model) {
            const system_prompt_ranking = `You are an AI assistant specializing in legal risk and action prioritization. ${AI_PROFESSIONAL_TONE_AU_SPELLING} You will be given a list of ${itemType}s identified in a legal document analysis. Your task is to rank them from most critical/impactful to least critical/impactful. Output *only* the reordered list of items, each on a new line. Do not add numbers, bullets, introductory text, or any other text before or after the list. Preserve the original wording of each item exactly.`;
            const user_prompt_ranking = `Please rank the following ${itemType}s based on their potential criticality and impact concerning a legal document. List the most critical first, down to the least critical. Maintain the exact original phrasing for each item. Output each item on a new line, with no other formatting:\n\n${itemsArray.join('\n')}`;
            const requestBody = { model: model, messages: [ { role: "system", content: system_prompt_ranking }, { role: "user", content: user_prompt_ranking } ], temperature: 1 };
            const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`}, body: JSON.stringify(requestBody) });
            logProgress(`Ranking API for ${itemType}s responded with status: ${response.status}`);
            const data = await response.json();
            if (!response.ok) { const errorText = data.error ? data.error.message : await response.text(); throw new Error(`API Error (${response.status}) ranking ${itemType}s: ${errorText}`); }
            if (!data.choices?.[0]?.message?.content) { throw new Error(`Ranking API response format error for ${itemType}s: No content.`); }
            const rankedItemsText = data.choices[0].message.content.trim();
            const rankedItemsArray = rankedItemsText.split('\n').map(item => item.trim()).filter(item => item);
            if (rankedItemsArray.length === itemsArray.length && itemsArray.every(item => rankedItemsArray.includes(item)) && rankedItemsArray.every(item => itemsArray.includes(item))) {
                 return { rankedItems: rankedItemsArray, usage: { input: data.usage?.prompt_tokens || 0, output: data.usage?.completion_tokens || 0 } };
            } else {
                logProgress(`Warning: Ranked ${itemType}s list from AI does not seem to be a direct permutation. Original: ${itemsArray.length}, Ranked: ${rankedItemsArray.length}. Falling back to original order.`);
                return { rankedItems: itemsArray, usage: { input: data.usage?.prompt_tokens || 0, output: data.usage?.completion_tokens || 0 } }; 
            }
        }

        async function generateExecutiveSummary(finalConsolidatedData, apiKey, model, areaOfPractice) {
            if (!executiveSummaryContentDiv) return;
            let summaryInputText = `Document Area: ${areaOfPractice || 'General'}\n`;
            summaryInputText += `Consolidated Strengths (unranked):\n - ${finalConsolidatedData.strengths.join("\n - ") || "None identified."}\n\n`;
            summaryInputText += `Consolidated Weaknesses/Risks (Ranked - most critical first):\n - ${finalConsolidatedData.weaknesses.join("\n - ") || "None identified."}\n\n`;
            summaryInputText += `Consolidated Recommendations (Ranked - most important first):\n - ${finalConsolidatedData.recommendations.map(r => r.text).join("\n - ") || "None provided."}\n\n`;
            if (finalConsolidatedData.averageScore !== "N/A") summaryInputText += `Average Robustness Score (across all final stage runs and scenarios): ${finalConsolidatedData.averageScore}/10\n`;
            summaryInputText += `\nBased on the above consolidated findings from multiple AI analyses (including QA checks and multiple runs per stage) of a legal document against various scenarios, please provide a concise executive summary. This summary should be suitable for a lawyer. Highlight the most critical overall findings and any overarching themes regarding the document's resilience or areas needing urgent attention, considering the ranked importance of weaknesses and recommendations. If specific clause numbers were frequently mentioned as critical, briefly note that pattern if significant. Use Australian English spelling and maintain a professional tone.`;
            const exec_summary_system_prompt = `You are an AI legal analyst. Your task is to synthesize the provided consolidated findings (which include ranked lists) into a high-level executive summary for a lawyer. ${AI_PROFESSIONAL_TONE_AU_SPELLING}`;
            let execSummaryInputTokens = 0, execSummaryOutputTokens = 0;
            try {
                const requestBody = { model: model, messages: [ { role: "system", content: exec_summary_system_prompt }, { role: "user", content: summaryInputText } ], temperature: 1 };
                const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`}, body: JSON.stringify(requestBody) });
                logProgress(`Executive Summary API responded with status: ${response.status}`);
                if (!response.ok) { const errorText = await response.text(); let eD="API Error"; try{const ed=JSON.parse(errorText);eD=ed.error?ed.error.message:errorText;}catch(e){eD=errorText;} throw new Error(`API Error (${response.status}): ${eD}`);}
                const data = await response.json();
                if (data.usage) { execSummaryInputTokens = data.usage.prompt_tokens || 0; execSummaryOutputTokens = data.usage.completion_tokens || 0; logProgress(`Executive Summary Token Usage: Input=${execSummaryInputTokens}, Output=${execSummaryOutputTokens}`);}
                if (!data.choices?.[0]?.message?.content) { throw new Error("Exec Summary API response format error."); }
                const summaryHtml = `<p>${escapeHtml(data.choices[0].message.content).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
                executiveSummaryContentDiv.innerHTML = summaryHtml;
                if (!fullConsolidatedReportData) fullConsolidatedReportData = {};
                fullConsolidatedReportData.executiveSummaryHtml = summaryHtml; 
                fullConsolidatedReportData.executiveSummaryText = data.choices[0].message.content; 
                logProgress("Executive summary generated.");
                if(executiveSummaryCostDisplayP) calculateAndDisplaySingleCallCost(execSummaryInputTokens, execSummaryOutputTokens, model, executiveSummaryCostDisplayP, "Executive Summary");
            } catch (error) {
                logProgress(`Executive Summary Generation FAILED: ${error.message}`);
                executiveSummaryContentDiv.innerHTML = `<p style="color:red;"><em>Error generating executive summary: ${escapeHtml(error.message)}</em></p>`;
                console.error("Error generating executive summary:", error);
                if (!fullConsolidatedReportData) fullConsolidatedReportData = {};
                fullConsolidatedReportData.executiveSummaryHtml = `<p style="color:red;"><em>Error generating executive summary.</em></p>`;
                fullConsolidatedReportData.executiveSummaryText = "Error generating executive summary.";
            }
        }

        function calculateAndDisplayMainCosts(inputTokens, outputTokens, modelId) { 
            if (!usageStatsPanelDiv) return;
            usageStatsPanelDiv.style.display = 'block';
            document.getElementById('totalInputTokens').textContent = inputTokens;
            document.getElementById('totalOutputTokens').textContent = outputTokens;
            document.getElementById('grandTotalTokens').textContent = inputTokens + outputTokens;
            const pricing = modelPricingUSD_per_1M_Tokens[modelId]; let costUSD = 0;
            if (pricing) costUSD = (inputTokens / 1000000 * pricing.input) + (outputTokens / 1000000 * pricing.output); else logProgress(`Warning: Pricing for model ${modelId} not found.`);
            document.getElementById('estimatedCostUSD').textContent = costUSD.toFixed(4);
            const exchangeRate = parseFloat(audExchangeRateInput.value) || 1.50; document.getElementById('displayAudRate').textContent = exchangeRate.toFixed(2); const costAUD = costUSD * exchangeRate; document.getElementById('estimatedCostAUD').textContent = costAUD.toFixed(4);
            if (!fullConsolidatedReportData.usage) fullConsolidatedReportData.usage = {};
            fullConsolidatedReportData.usage.totalAnalysisInputTokens = inputTokens;
            fullConsolidatedReportData.usage.totalAnalysisOutputTokens = outputTokens;
            fullConsolidatedReportData.usage.analysisCostUSD = costUSD.toFixed(4);
            fullConsolidatedReportData.usage.analysisCostAUD = costAUD.toFixed(4);
        }

        function calculateAndDisplaySingleCallCost(inputTokens, outputTokens, modelId, displayElement, callType, appendToUsagePanel = false) {
            if (!displayElement && !appendToUsagePanel) { console.warn(`Display element for ${callType} cost not found.`); return;}
            let costUSD = 0;
            const pricing = modelPricingUSD_per_1M_Tokens[modelId];
            if (pricing) costUSD = (inputTokens / 1000000 * pricing.input) + (outputTokens / 1000000 * pricing.output);
            const exchangeRate = parseFloat(audExchangeRateInput.value) || 1.50;
            const costAUD = costUSD * exchangeRate;
            const costText = `${callType} Cost: $${costUSD.toFixed(4)} USD (A$${costAUD.toFixed(4)} AUD) | Tokens: ${inputTokens} In / ${outputTokens} Out`;
            
            if (appendToUsagePanel && usageStatsPanelDiv) {
                let p = document.createElement('p');
                p.style.fontSize = '0.9em';
                p.style.marginTop = '5px';
                p.textContent = costText;
                // Find a good place to append, e.g. before the buttons
                const firstButton = usageStatsPanelDiv.querySelector('button');
                if (firstButton) {
                    usageStatsPanelDiv.insertBefore(p, firstButton);
                } else {
                    usageStatsPanelDiv.appendChild(p);
                }
            } else if (displayElement) {
                 displayElement.textContent = costText;
            }

            if (!fullConsolidatedReportData.otherCosts) fullConsolidatedReportData.otherCosts = {};
            fullConsolidatedReportData.otherCosts[callType.replace(/\s+/g, '')] = { text: costText, inputTokens: inputTokens, outputTokens: outputTokens, costUSD: costUSD.toFixed(4), costAUD: costAUD.toFixed(4) };
        }

        function downloadReport(format = 'json') {
            if (format === 'json') {
                if (allRunsRawData.length === 0 && Object.keys(fullConsolidatedReportData).length === 0) { 
                    alert("No data to download for JSON report."); 
                    logProgress("JSON Report download aborted: No data.");
                    return; 
                }
                const dataToDownload = { 
                    reportVersion: "v14_jsPDF_Markdown", 
                    documentName: fileInput.files[0] ? fileInput.files[0].name : "N/A", 
                    areaOfPractice: getSelectedAreaOfPractice(), 
                    scenariosTested: scenariosTextarea.value.trim().split('\n').filter(s => s.trim() !== ''), 
                    analysisStages: analysisStagesSelect.value, 
                    runsPerStage: runsPerStageSelect.value,
                    modelUsed: apiModelSelect.value, 
                    timestamp: new Date().toISOString(), 
                    consolidatedAnalysis: fullConsolidatedReportData, 
                    detailedRunData: allRunsRawData 
                };
                const jsonData = JSON.stringify(dataToDownload, null, 2); 
                const blob = new Blob([jsonData], { type: 'application/json' }); 
                const url = URL.createObjectURL(blob); 
                const a = document.createElement('a'); a.href = url; a.download = `ArgonLaw_AI_StressTest_Report_${new Date().toISOString().slice(0,10)}.json`; 
                document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); 
                logProgress("JSON Report downloaded.");
            } else if (format === 'pdf') {
                logProgress("Full Report PDF (jsPDF): Preparing for generation.");
                if (!fullConsolidatedReportData || Object.keys(fullConsolidatedReportData).length === 0) {
                    logProgress("Full Report PDF (jsPDF): Aborted, no consolidated data available.");
                    alert("Cannot generate PDF report: No consolidated data available.");
                    return;
                }

                const tempContainerId = 'tempPdfReportContainer';
                let tempContainer = document.getElementById(tempContainerId);
                if (tempContainer) tempContainer.remove(); 

                tempContainer = document.createElement('div');
                tempContainer.id = tempContainerId;
                tempContainer.style.position = 'fixed'; tempContainer.style.left = '-3000px'; 
                tempContainer.style.top = '0px';
                tempContainer.style.width = '210mm'; 
                tempContainer.style.height = 'auto'; 
                tempContainer.style.zIndex = '-100'; 
                tempContainer.style.backgroundColor = '#fff'; 

                const reportElementOriginal = document.getElementById('pdfReportContentTemplate');
                if (!reportElementOriginal) {
                    logProgress("Full Report PDF (jsPDF): ERROR - pdfReportContentTemplate not found!");
                    displayError("PDF template missing. Cannot generate report.");
                    return;
                }
                const reportElement = reportElementOriginal.cloneNode(true);
                reportElement.id = 'pdfReportContentActive';
                reportElement.style.display = 'block'; 
                reportElement.style.padding = "10mm";
                reportElement.style.width = 'calc(210mm - 20mm)'; 
                reportElement.style.boxSizing = 'border-box';
                reportElement.style.fontFamily = "'Nunito Sans', sans-serif"; 

                reportElement.querySelector('#pdfReportDate').textContent = new Date().toLocaleString();
                reportElement.querySelector('#pdfReportDocName').textContent = fileInput.files[0] ? escapeHtml(fileInput.files[0].name) : "N/A";
                reportElement.querySelector('#pdfReportArea').textContent = escapeHtml(getSelectedAreaOfPractice()) || "N/A";
                reportElement.querySelector('#pdfReportModel').textContent = escapeHtml(modelPricingUSD_per_1M_Tokens[apiModelSelect.value]?.displayName || apiModelSelect.value) || "N/A";
                reportElement.querySelector('#pdfReportAnalysisConfig').textContent = `${escapeHtml(analysisStagesSelect.options[analysisStagesSelect.selectedIndex].text)}, ${escapeHtml(runsPerStageSelect.options[runsPerStageSelect.selectedIndex].text)}`;
                reportElement.querySelector('#pdfReportExecSummary').innerHTML = fullConsolidatedReportData.executiveSummaryHtml || "<p><em>Executive summary not available.</em></p>";
                reportElement.querySelector('#pdfReportStrengths').innerHTML = (fullConsolidatedReportData.strengths && fullConsolidatedReportData.strengths.length > 0 ? fullConsolidatedReportData.strengths.map(s => `<li>${escapeHtml(s)}</li>`).join('') : "<li>No distinct strengths identified.</li>");
                reportElement.querySelector('#pdfReportWeaknesses').innerHTML = (fullConsolidatedReportData.weaknesses && fullConsolidatedReportData.weaknesses.length > 0 ? fullConsolidatedReportData.weaknesses.map(w => `<li>${escapeHtml(w)}</li>`).join('') : "<li>No distinct weaknesses identified.</li>");
                reportElement.querySelector('#pdfReportRecommendations').innerHTML = (fullConsolidatedReportData.recommendations && fullConsolidatedReportData.recommendations.length > 0 ? fullConsolidatedReportData.recommendations.map(r => `<li>${escapeHtml(r.text)} ${r.rationale ? `<em>(${escapeHtml(r.rationale)})</em>` : ''}</li>`).join('') : "<li>No distinct recommendations identified.</li>");
                reportElement.querySelector('#pdfReportAvgScore').textContent = `Average Score: ${escapeHtml(fullConsolidatedReportData.averageScore) || "N/A"}/10`;
                let usageHtml = "";
                if (fullConsolidatedReportData.usage) {
                    usageHtml += `<p>Analysis Stages Tokens (In/Out): ${fullConsolidatedReportData.usage.totalAnalysisInputTokens || 0} / ${fullConsolidatedReportData.usage.totalAnalysisOutputTokens || 0}</p>`;
                    usageHtml += `<p>Analysis Stages Cost: ${fullConsolidatedReportData.usage.analysisCostUSD || '0.00'} USD / ${fullConsolidatedReportData.usage.analysisCostAUD || '0.00'} AUD</p>`;
                }
                if (fullConsolidatedReportData.otherCosts) {
                    for (const key in fullConsolidatedReportData.otherCosts) {
                        if (fullConsolidatedReportData.otherCosts[key] && fullConsolidatedReportData.otherCosts[key].text) {
                            usageHtml += `<p>${escapeHtml(fullConsolidatedReportData.otherCosts[key].text)}</p>`;
                        }
                    }
                }
                reportElement.querySelector('#pdfReportUsageStats').innerHTML = usageHtml || "<p>No usage data recorded.</p>";
                const disclaimerContainerMain = document.querySelector('.container > .disclaimer');
				if (disclaimerContainerMain) {
					const mainDisclaimerP = disclaimerContainerMain.querySelector('p');
					if (mainDisclaimerP) {
						reportElement.querySelector('#pdfReportContentActive .disclaimer p').innerHTML = mainDisclaimerP.innerHTML;
					}
				}
				
                tempContainer.appendChild(reportElement);
                document.body.appendChild(tempContainer);

                setTimeout(() => {
                    logProgress(`Full Report PDF (jsPDF): Temp container appended. reportElement.scrollHeight: ${reportElement.scrollHeight}`);
                    const { jsPDF } = window.jspdf;
                    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
					const html2canvasOptions = { scale: .29, useCORS: true, logging: false, backgroundColor: '#ffffff' };
					
					pdf.html(reportElement, {
						html2canvas: html2canvasOptions, autoPaging: 'slice', x: 0, y: 0, width: 210, windowWidth: reportElement.offsetWidth 
					}).then(() => {
                        pdf.save(`ArgonLaw_AI_StressTest_Report_${new Date().toISOString().slice(0,10)}.pdf`);
                        logProgress("Full Report PDF (jsPDF): Saved.");
                    }).catch(err => {
                        logProgress(`Full Report PDF (jsPDF): jsPDF.html() error: ${err.message}`);
                        displayError(`PDF Report Generation Error (jsPDF): ${err.message}`);
                        console.error("jsPDF PDF report generation error:", err);
                    }).finally(() => {
                        if (document.body.contains(tempContainer)) {
                            document.body.removeChild(tempContainer);
                            logProgress("Full Report PDF (jsPDF): Temp container removed.");
                        }
                    });
                }, 250); 
            }
        }

        async function generateRevisedDocumentAI() {
            logProgress("AI Document Revision Initiated (Experimental).");
            if (!documentTextContent) { displayError("Original document content is missing."); return; }
            if (!fullConsolidatedReportData || !fullConsolidatedReportData.recommendations || fullConsolidatedReportData.recommendations.length === 0) {
                displayError("No consolidated recommendations available to guide revision."); return;
            }
            const apiKey = document.getElementById('apiKey').value.trim();
            const model = revisionApiModelSelect.value; // Use revision-specific model
            if (!apiKey) { displayError("API Key is required for document revision."); return; }

            if (generateRevisedDocBtn) generateRevisedDocBtn.disabled = true; 
            if (revisedDocBtnSpinner) revisedDocBtnSpinner.style.display = 'inline-block'; 
            if (revisedDocBtnText) revisedDocBtnText.textContent = 'Drafting...'; 
            if (revisedDocLoadingIndicator) revisedDocLoadingIndicator.style.display = 'block'; 
            if (revisedDocDisplayDiv) revisedDocDisplayDiv.innerHTML = ""; 
            rawRevisedMarkdownContent = ""; // Clear previous content
            
            if (downloadRevisedTxtBtn) downloadRevisedTxtBtn.style.display = 'none';
            if (downloadRevisedPdfBtn) downloadRevisedPdfBtn.style.display = 'none';
            if (copyRevisedDocBtn) copyRevisedDocBtn.style.display = 'none';

            const rankedRecommendationsText = fullConsolidatedReportData.recommendations.map((rec, index) => `${index + 1}. ${rec.text} ${rec.rationale ? `(Rationale: ${rec.rationale})` : ''}`).join('\n');
            const combinedLength = documentTextContent.length + rankedRecommendationsText.length;
            logProgress(`Approximate input characters for revision: ${combinedLength}.`);
            if (revisedDocLoadingMessageP) revisedDocLoadingMessageP.textContent = `Drafting revised document... Input approx ${combinedLength} characters.`;
            
            // MODIFIED: Prompt for Markdown output
            const revision_system_prompt = `You are an expert AI legal document drafter. ${AI_PROFESSIONAL_TONE_AU_SPELLING} You will be provided with an original legal document and a list of ranked recommendations (most important first) to improve it. Your task is to meticulously review the original document and attempt to incorporate ALL the recommendations to produce a revised version of the document.\n- Preserve the original structure, headings, and formatting concepts as much as possible, expressing them in Markdown.\n- Integrate changes smoothly and coherently.\n- If a recommendation cannot be applied or is unclear, you may note this as a comment within the revised text (e.g. "<!-- AI Note: Recommendation X could not be applied due to Y -->").\n- Your output should be *only the full text of the revised document, formatted in Markdown*. Use Markdown for headings (e.g. # Heading 1, ## Heading 2), lists (e.g. - item or 1. item), bold (**text**), italics (*text*), paragraphs, and horizontal rules (---). Do not use HTML tags directly. Do not add any introductory or concluding remarks outside the document text itself.\n- Handle long documents: if the document is very long, focus on applying changes to relevant sections. Acknowledge if full revision is beyond capacity.\n- This is a DRAFT. Accuracy is paramount where changes are made.`;
            const revision_user_prompt = `ORIGINAL DOCUMENT TEXT:\n---\n${documentTextContent}\n---\nRANKED RECOMMENDATIONS (most important first):\n---\n${rankedRecommendationsText}\n---\nPlease provide the fully revised document text incorporating all these recommendations. Output ONLY the revised document text, formatted in Markdown.`;
            
            let revisionInputTokens = 0, revisionOutputTokens = 0;
            try {
                const requestBody = { model: model, messages: [ { role: "system", content: revision_system_prompt }, { role: "user", content: revision_user_prompt } ], temperature: 1 }; 
                logProgress(`Sending document revision request to AI model: ${model}...`);
                const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`}, body: JSON.stringify(requestBody) });
                logProgress(`Document Revision API responded with status: ${response.status}`);
                const data = await response.json();
                if (data.usage) { revisionInputTokens = data.usage.prompt_tokens || 0; revisionOutputTokens = data.usage.completion_tokens || 0; logProgress(`Document Revision Token Usage: Input=${revisionInputTokens}, Output=${revisionOutputTokens}`);}
                if (!response.ok) { const errorText = data.error ? data.error.message : await response.text(); throw new Error(`API Error (${response.status}) during revision: ${errorText}`);}
                if (!data.choices?.[0]?.message?.content) { throw new Error("Revision API response format error: No content."); }
                
                rawRevisedMarkdownContent = data.choices[0].message.content; // Store raw Markdown
                const revisedHtml = simpleMarkdownToHtml(rawRevisedMarkdownContent); // Convert to HTML
                
                if (revisedDocDisplayDiv) revisedDocDisplayDiv.innerHTML = revisedHtml;
                
                if (rawRevisedMarkdownContent && rawRevisedMarkdownContent.trim() !== "") {
                    if (downloadRevisedTxtBtn) downloadRevisedTxtBtn.style.display = 'inline-block';
                    if (downloadRevisedPdfBtn) downloadRevisedPdfBtn.style.display = 'inline-block';
                    if (copyRevisedDocBtn) copyRevisedDocBtn.style.display = 'inline-block';
                }
                logProgress("AI Document Revision completed successfully.");
                if(revisedDocCostDisplayP) calculateAndDisplaySingleCallCost(revisionInputTokens, revisionOutputTokens, model, revisedDocCostDisplayP, "Document Revision");
            } catch (error) {
                logProgress(`AI Document Revision FAILED: ${error.message}`);
                displayError('Error during AI document revision: ' + error.message);
                console.error("Error revising document:", error);
                if (revisedDocDisplayDiv) revisedDocDisplayDiv.innerHTML = `<p style="color:var(--argon-error-color)">Error during revision: ${escapeHtml(error.message)}</p><p>(Original document content was not modified.)</p>`; 
                if(revisedDocCostDisplayP && (revisionInputTokens > 0 || revisionOutputTokens > 0) ) calculateAndDisplaySingleCallCost(revisionInputTokens, revisionOutputTokens, model, revisedDocCostDisplayP, "Document Revision (Failed Attempt)");
            } finally {
                if (generateRevisedDocBtn) generateRevisedDocBtn.disabled = false; 
                if (revisedDocBtnSpinner) revisedDocBtnSpinner.style.display = 'none'; 
                if (revisedDocBtnText) revisedDocBtnText.textContent = 'Generate Revised Document Draft'; 
                if (revisedDocLoadingIndicator) revisedDocLoadingIndicator.style.display = 'none'; 
            }
        }
        
        function simpleMarkdownToHtml(md) {
            if (typeof md !== 'string') return '';
            let html = md;

            // Escape HTML characters first to prevent injection if markdown contains them from source
            // This simple escaper is basic. A library would be more robust.
            html = html.replace(/&/g, '&amp;')
                       .replace(/</g, '&lt;')
                       .replace(/>/g, '&gt;')
                       .replace(/"/g, '&quot;')
                       .replace(/'/g, '&#039;');

            // Process Markdown elements
            // Headers (H1-H6)
            html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
            html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
            html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
            html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
            html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
            html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

            // Links [text](url) - must be before bold/italic for [*text*](url) cases
            html = html.replace(/\[([^\[]+)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>');

            // Bold (**text** or __text__)
            html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
            html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');
            
            // Italic (*text* or _text_) - careful with * in links or around **
            html = html.replace(/(^|[^A-Za-z0-9*])\*(?!\s|\*)(.+?)(?<!\s|\*)\*($|[^A-Za-z0-9*])/gim, '$1<em>$2</em>$3');
            html = html.replace(/(^|[^A-Za-z0-9_])_(?!\s|_)(.+?)(?<!\s|_)_($|[^A-Za-z0-9_])/gim, '$1<em>$2</em>$3');


            // Horizontal Rule
            html = html.replace(/^\s*(?:---|\*\*\*|___)\s*$/gm, '<hr>');

            // Process blocks (paragraphs and lists)
            let blocks = html.split(/\n\s*\n/); // Split by one or more empty lines
            let inList = false;
            let listType = ''; // 'ul' or 'ol'
            
            html = blocks.map(block => {
                if (block.trim() === '') return '';

                // Check if it's already an HTML block element (from headers, hr)
                if (block.match(/^<(h[1-6]|hr)/i)) {
                     if (inList) { block = `</${listType}>` + block; inList = false; listType = ''; }
                    return block;
                }

                // List processing
                let listItemsHtml = '';
                const lines = block.split('\n');
                let isBlockList = false;

                for (let i = 0; i < lines.length; i++) {
                    let line = lines[i];
                    const ulMatch = line.match(/^(\s*)[-*+] (.*)/);
                    const olMatch = line.match(/^(\s*)\d+\. (.*)/);

                    if (ulMatch) {
                        isBlockList = true;
                        if (!inList || listType !== 'ul') {
                            listItemsHtml += (inList ? `</${listType}>` : '') + '<ul>';
                            inList = true; listType = 'ul';
                        }
                        listItemsHtml += `<li>${ulMatch[2]}</li>`;
                    } else if (olMatch) {
                        isBlockList = true;
                        if (!inList || listType !== 'ol') {
                            listItemsHtml += (inList ? `</${listType}>` : '') + '<ol>';
                            inList = true; listType = 'ol';
                        }
                        listItemsHtml += `<li>${olMatch[2]}</li>`;
                    } else { // Not a list item or end of list within block
                        if (inList) {
                            listItemsHtml += `</${listType}>`;
                            inList = false; listType = '';
                        }
                        if (isBlockList) { // If we were processing a list and found a non-list line
                             listItemsHtml += (line.trim() ? '<p>' + line.replace(/\n/g, '<br>') + '</p>' : '');
                        }
                        // If it wasn't a list block from the start, it will be handled as a paragraph below
                    }
                }
                
                if (isBlockList) {
                     if (inList) listItemsHtml += `</${listType}>`; // Close list if block ends with it
                     inList = false; listType = ''; // Reset for next block
                     return listItemsHtml;
                }

                // If not a list block, and not an already processed HTML block, treat as paragraph
                 if (inList) { // Should close list from previous block if any
                    let prefix = `</${listType}>`; inList = false; listType = '';
                    return prefix + '<p>' + block.replace(/\n/g, '<br>') + '</p>';
                }
                return '<p>' + block.replace(/\n/g, '<br>') + '</p>';

            }).join('');
            
            if (inList) { // Close any unclosed list at the very end
                html += `</${listType}>`;
            }
            
            // Cleanup: remove empty paragraphs that might be generated
            html = html.replace(/<p>\s*<\/p>/g, '');
            html = html.replace(/<ul>\s*<\/ul>/g, '');
            html = html.replace(/<ol>\s*<\/ol>/g, '');


            return html;
        }


        function copyRevisedDocumentText() {
            if (!rawRevisedMarkdownContent || rawRevisedMarkdownContent.trim() === "") {
                logProgress("Copy Revised Text: No content to copy.");
                if (copyRevisedDocBtn) {
                    const originalText = copyRevisedDocBtn.textContent;
                    copyRevisedDocBtn.textContent = 'No Text!';
                     setTimeout(() => { copyRevisedDocBtn.textContent = originalText; }, 1500);
                }
                return;
            }
            navigator.clipboard.writeText(rawRevisedMarkdownContent).then(() => {
                logProgress("Revised document raw Markdown copied to clipboard.");
                if (copyRevisedDocBtn) {
                    const originalText = copyRevisedDocBtn.textContent;
                    copyRevisedDocBtn.textContent = 'Copied Markdown!';
                    setTimeout(() => { copyRevisedDocBtn.textContent = originalText; }, 2000);
                }
            }).catch(err => {
                logProgress(`Copy Revised Text: Failed to copy - ${err.message}`);
                console.error('Failed to copy text: ', err);
                alert('Failed to copy text. Your browser might not support this. You may need to copy manually.');
            });
        }

        function downloadRevisedDocument(format) {
            if (!rawRevisedMarkdownContent || rawRevisedMarkdownContent.trim() === "") { 
                alert("No revised document content to download."); 
                logProgress("Revised Doc Download Aborted: No content.");
                return; 
            }
            const filenameBase = `ArgonLaw_AI_Revised_Doc_${new Date().toISOString().slice(0,10)}`;

            if (format === 'txt') { // Save as raw Markdown
                const blob = new Blob([rawRevisedMarkdownContent], { type: 'text/markdown;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `${filenameBase}.md`; // Suggest .md extension
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
                URL.revokeObjectURL(url);
                logProgress("Revised document downloaded as TXT (Markdown).");
            } else if (format === 'pdf') {
                logProgress("Revised Doc PDF (jsPDF): Preparing for generation.");
                
                const tempContainerId = 'tempPdfRevisedContainer';
                let tempContainer = document.getElementById(tempContainerId);
                if (tempContainer) tempContainer.remove();

                tempContainer = document.createElement('div');
                tempContainer.id = tempContainerId;
                tempContainer.style.position = 'fixed'; tempContainer.style.left = '-3000px';
                tempContainer.style.top = '0px';
                tempContainer.style.width = '210mm'; 
                tempContainer.style.height = 'auto';
                tempContainer.style.zIndex = '-100';
                tempContainer.style.backgroundColor = '#fff';

                const pdfElement = document.createElement('div');
                pdfElement.style.fontFamily = "'Nunito Sans', sans-serif";
                pdfElement.style.padding = "15mm"; 
                pdfElement.style.fontSize = "10pt";
                pdfElement.style.lineHeight = "1.5";
                pdfElement.style.width = 'calc(210mm - 30mm)'; 
                pdfElement.style.boxSizing = 'border-box';
                pdfElement.style.wordBreak = "break-word"; // Good for PDF rendering
                
                // Apply styles similar to #revisedDocDisplay for consistency in PDF
                const displayStyles = document.getElementById('revisedDocDisplay').style;
                Object.assign(pdfElement.style, {
                    minHeight: displayStyles.minHeight,
                    whiteSpace: 'normal' // Ensure it's not pre-wrap for PDF HTML
                });
                pdfElement.innerHTML = simpleMarkdownToHtml(rawRevisedMarkdownContent); // Render Markdown to HTML

                tempContainer.appendChild(pdfElement);
                document.body.appendChild(tempContainer);

                setTimeout(() => {
                    logProgress(`Revised Doc PDF (jsPDF): Temp container appended. pdfElement.scrollHeight: ${pdfElement.scrollHeight}`);
                    const { jsPDF } = window.jspdf;
                    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
					const html2canvasOptions = { scale: .29, useCORS: true, logging: false, backgroundColor: '#ffffff' };

					pdf.html(pdfElement, {
						html2canvas: html2canvasOptions, autoPaging: 'slice', x: 0, y: 0, width: 210, windowWidth: pdfElement.offsetWidth 
					}).then(() => {
                        pdf.save(`${filenameBase}.pdf`);
                        logProgress("Revised Doc PDF (jsPDF): Saved.");
                    }).catch(err => {
                        logProgress(`Revised Doc PDF (jsPDF): jsPDF.html() error: ${err.message}`);
                        displayError(`Revised Doc PDF Error (jsPDF): ${err.message}`);
                        console.error("jsPDF Revised PDF generation error:", err);
                    }).finally(() => {
                        if (document.body.contains(tempContainer)) {
                            document.body.removeChild(tempContainer);
                            logProgress("Revised Doc PDF (jsPDF): Temp container removed.");
                        }
                    });
                }, 250);
            }
        }

        function escapeJsonString(str) { if (typeof str !== 'string') return ''; return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');}
		function escapeHtml(unsafe) {
			if (typeof unsafe !== 'string') {
				return unsafe === null || unsafe === undefined ? '' : String(unsafe);
			}
			return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;"); 
		}
        function showLoading(isLoading, message = "Processing...") { 
            if (loadingIndicatorDiv && stressTestButton && btnSpinner && btnText && loadingMessageP) { 
                if (isLoading) { 
                    loadingMessageP.textContent = message; 
                    loadingIndicatorDiv.style.display = 'block'; 
                    // stressTestButton.disabled = true; // This will be handled by main function
                    if(btnSpinner) btnSpinner.style.display = 'inline-block'; 
                    if(btnText) btnText.textContent = 'Processing...'; 
                    if(suggestScenariosBtn) suggestScenariosBtn.disabled = true; 
                    if(generateRevisedDocBtn) generateRevisedDocBtn.disabled = true;
                } else { 
                    loadingIndicatorDiv.style.display = 'none'; 
                    // stressTestButton.disabled = false; // This will be handled by main function
                    if(btnSpinner) btnSpinner.style.display = 'none'; 
                    if(btnText) btnText.textContent = 'Run Stress Test'; 
                    if(suggestScenariosBtn) suggestScenariosBtn.disabled = false; 
                    if(generateRevisedDocBtn) generateRevisedDocBtn.disabled = false;
                    if(stopStressTestBtn) {
                        stopStressTestBtn.style.display = 'none';
                        stopStressTestBtn.disabled = false;
                    }
                    if(stressTestButton) stressTestButton.disabled = false;
                } 
            } 
        }
        function displayError(message) { if(errorDisplayDiv) { const formattedMessage = String(message).replace(/\n/g, '<br>'); errorDisplayDiv.innerHTML = formattedMessage; errorDisplayDiv.style.display = 'block'; window.scrollTo(0, errorDisplayDiv.offsetTop - 20); } else { console.error("Error display div not found. Error:", message); alert("Error: " + message); } }
        function hideError() { if(errorDisplayDiv) errorDisplayDiv.style.display = 'none';}
        