document.addEventListener('DOMContentLoaded', () => {

    const navLinks = document.querySelectorAll('#main-nav a');
    const contentContainer = document.getElementById('main-content-container');
    const themeToggle = document.getElementById('themeToggle');
    let currentModule = null;

    // Function to load a module's HTML and JS
    async function loadModule(moduleName) {
        if (!moduleName) return;
        contentContainer.innerHTML = '<div class="spinner" style="margin: 60px auto;"></div>'; // Show a loading indicator

        try {
            // Fetch the HTML fragment
            const response = await fetch(`modules/${moduleName}.html`);
            if (!response.ok) throw new Error(`Could not load module: ${moduleName}`);
            const html = await response.text();
            contentContainer.innerHTML = html;
            
            // Now, load the specific JS for that module, if it exists
            loadModuleScript(moduleName);

        } catch (error) {
            console.error('Failed to fetch module:', error);
            contentContainer.innerHTML = `<div class="panel"><h2>Error</h2><p>Could not load the requested tool. Please check the console for details.</p></div>`;
        }
    }

    // Helper function to load the JS for a module
    function loadModuleScript(moduleName) {
        const oldScript = document.getElementById('module-script');
        if (oldScript) oldScript.remove();

        const script = document.createElement('script');
        script.id = 'module-script';
        script.src = `js/modules/${moduleName}.js`;
        script.onerror = () => script.remove(); // Clean up if script not found
        document.body.appendChild(script);
    }

    // Navigation click handler
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            if (!targetId) return;
            const targetModule = targetId.replace('page-', '');

            if(targetModule === currentModule) return; 

            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');
            
            loadModule(targetModule);
            currentModule = targetModule;
            // Update the URL hash for better navigation history (optional but good)
            window.location.hash = targetModule;
        });
    });
    
    // --- Global Theme Toggle Logic ---
    const savedTheme = localStorage.getItem('argon-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.checked = (savedTheme === 'dark');
    themeToggle.addEventListener('change', () => {
        const theme = themeToggle.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('argon-theme', theme);
    });

    // Load initial module based on URL hash or default
    const initialModule = window.location.hash.replace('#', '') || 'analysis-tool';
    const initialLink = document.querySelector(`a[data-target='page-${initialModule}']`) || document.querySelector('a.active');
    
    if (initialLink) {
        initialLink.click();
    }
});