document.addEventListener('DOMContentLoaded', () => {

        // ===============================================================
        // MASTER NAVIGATION LOGIC
        // This script handles switching between all pages. It requires no
        // changes to support new pages added via the HTML structure.
        // ===============================================================
        const navLinks = document.querySelectorAll('#main-nav a');
        const pageContents = document.querySelectorAll('.main-content .page-content');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault(); // Stop the link from trying to navigate away

                const targetId = link.getAttribute('data-target');
                const targetPage = document.getElementById(targetId);

                // 1. Update active state on sidebar links
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                link.classList.add('active');

                // 2. Hide all pages and show the target page
                pageContents.forEach(page => page.classList.remove('active'));
                if (targetPage) {
                    targetPage.classList.add('active');
                }
            });
        });

        // ===============================================================
        // THEME TOGGLE LOGIC (Global)
        // ===============================================================
        const themeToggle = document.getElementById('themeToggle');
        const savedTheme = localStorage.getItem('argon-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.checked = (savedTheme === 'dark');
        themeToggle.addEventListener('change', () => {
            const theme = themeToggle.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('argon-theme', theme);
            // Re-render the chart on theme change if it exists
            if (analysisChart && window.lastChartData) {
                renderChart(window.lastChartData); 
            }
        });

        // ===============================================================
        // PAGE-SPECIFIC SCRIPT: A.I. ANALYSIS TOOL
        // This script only affects elements within #page-analysis-tool.
        // Null-checks are used to prevent errors when other pages are active.
        // ===============================================================
        const fileInput = document.getElementById('documentFile');
        const fileDropArea = document.getElementById('fileDropArea');
        const initialPrompt = document.getElementById('initial-prompt');
        const filePreview = document.getElementById('file-preview');
        const fileNameEl = document.getElementById('fileName');
        const fileSizeEl = document.getElementById('fileSize');
        const removeFileBtn = document.getElementById('removeFileBtn');
        const runAnalysisBtn = document.getElementById('runAnalysisBtn');
        const uploadPanel = document.getElementById('uploadPanel');
        const configPanel = document.getElementById('configPanel');
        const actionPanel = document.getElementById('actionPanel');
        const tabs = document.querySelectorAll('#page-analysis-tool .tab-button');
        const tabContents = document.querySelectorAll('#page-analysis-tool .tab-content');
        const workspace = document.getElementById('workspace');
        const loadingIndicator = document.getElementById('loadingIndicator');
        const resultsContainer = document.getElementById('resultsContainer');
        const newAnalysisBtn = document.getElementById('newAnalysisBtn');
        
        let analysisChart = null;
        let isFileUploaded = false;

        function setUIState(state) {
            // Ensure these containers exist before trying to modify them
            if (!workspace || !loadingIndicator || !resultsContainer) return;

            workspace.classList.add('hidden');
            loadingIndicator.classList.add('hidden');
            resultsContainer.classList.add('hidden');

            if (state === 'initial') {
                workspace.classList.remove('hidden');
                workspace.style.animation = 'fadeIn 0.5s ease-out';
                fileDropArea.classList.remove('has-file');
                initialPrompt.style.display = 'block';
                filePreview.style.display = 'none';
                fileInput.value = '';
                isFileUploaded = false;
                configPanel.classList.remove('visible');
                actionPanel.classList.remove('visible');
                runAnalysisBtn.disabled = true;
            } else if (state === 'file-uploaded') {
                workspace.classList.remove('hidden');
                configPanel.classList.add('visible');
                actionPanel.classList.add('visible');
                runAnalysisBtn.disabled = false;
                isFileUploaded = true;
            } else if (state === 'loading') {
                loadingIndicator.classList.remove('hidden');
            } else if (state === 'results') {
                resultsContainer.classList.remove('hidden');
                resultsContainer.style.animation = 'fadeIn 0.5s ease-out';
            }
        }
        
        // Null-check elements that only exist on the analysis page
        if (fileInput) {
            fileInput.addEventListener('change', handleFileSelect);
            removeFileBtn.addEventListener('click', () => setUIState('initial'));
            
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                fileDropArea.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false);
            });
            fileDropArea.addEventListener('drop', e => {
                fileInput.files = e.dataTransfer.files;
                handleFileSelect();
            });
        
            function handleFileSelect() {
                if (fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    fileNameEl.textContent = file.name;
                    fileSizeEl.textContent = `${(file.size / 1024).toFixed(1)} KB`;
                    fileDropArea.classList.add('has-file');
                    initialPrompt.style.display = 'none';
                    filePreview.style.display = 'flex';
                    setUIState('file-uploaded');
                }
            }

            runAnalysisBtn.addEventListener('click', () => {
                if (!isFileUploaded) return;
                setUIState('loading');
                setTimeout(() => {
                    const analysisData = generateDummyData();
                    renderResults(analysisData);
                    setUIState('results');
                }, 2500);
            });

            newAnalysisBtn.addEventListener('click', () => setUIState('initial'));
        }
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                tabContents.forEach(content => content.classList.remove('active'));
                const activeTabContent = document.getElementById(`tab-${tab.dataset.tab}`);
                if(activeTabContent) activeTabContent.classList.add('active');
            });
        });
        
        window.lastChartData = null; 

        function renderResults(data) {
            document.getElementById('resultsTitle').textContent = `For: ${fileInput.files[0].name}`;
            document.getElementById('kpi-risk').textContent = data.kpi.riskScore;
            document.getElementById('kpi-clauses').textContent = data.kpi.clauses;
            document.getElementById('kpi-parties').textContent = data.kpi.parties;
            document.getElementById('kpi-dates').textContent = data.kpi.dates;
            document.getElementById('details-list').innerHTML = data.details.map(item => `<li><strong>${item.type}:</strong> ${item.content}</li>`).join('');
            window.lastChartData = data.chart;
            renderChart(data.chart);
        }

        function renderChart(data) {
            const chartCanvas = document.getElementById('analysisChart');
            if(!chartCanvas) return; // Don't try to render if canvas isn't on the page
            const ctx = chartCanvas.getContext('2d');

            if (analysisChart) analysisChart.destroy();
            const style = getComputedStyle(document.body);
            const headingColor = style.getPropertyValue('--argon-heading-color');
            const labelColor = style.getPropertyValue('--argon-text-secondary');

            analysisChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.labels,
                    datasets: [{ data: data.values, backgroundColor: ['#A2AD00', '#002A42', '#5a6167', '#dde2e7'], borderColor: style.getPropertyValue('--argon-panel-bg'), borderWidth: 4, }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, cutout: '70%',
                    plugins: { legend: { position: 'right', labels: { color: labelColor, font: { weight: '600' } } }, title: { display: true, text: 'Document Content Breakdown', color: headingColor, font: { size: 18, weight: '700' } } }
                }
            });
        }
        
        function generateDummyData() {
            return {
                kpi: { riskScore: ['Low', 'Medium', 'High'][Math.floor(Math.random()*3)], clauses: Math.floor(Math.random() * 15) + 5, parties: Math.floor(Math.random() * 4) + 2, dates: Math.floor(Math.random() * 8) + 1, },
                chart: { labels: ['Standard Clauses', 'Financial Terms', 'Liability/Indemnity', 'General Boilerplate'], values: [Math.floor(Math.random() * 50) + 20, Math.floor(Math.random() * 30), Math.floor(Math.random() * 20), Math.floor(Math.random() * 40)] },
                details: [
                    {type: 'Risk Identified', content: 'Clause 8.2 (Indemnification) appears one-sided and may expose the client to undue liability.'},
                    {type: 'Key Date', content: 'Lease Commencement: 1 August 2025.'},
                    {type: 'Party Identified', content: 'Landlord: Acme Holdings Pty Ltd (ACN 123 456 789)'},
                    {type: 'Ambiguity', content: 'Definition of "Confidential Information" is broad and could be interpreted in multiple ways.'}
                ]
            };
        }
        // Initial state for the default page
        if(document.getElementById('page-analysis-tool').classList.contains('active')){
           setUIState('initial');
        }
    });