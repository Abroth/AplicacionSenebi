// Modo claro/oscuro, compartido entre Senebis Internos y Senebis Contraparte.
// Se guarda en localStorage para persistir entre sesiones del navegador.

function getSavedColorMode() {
    return localStorage.getItem('colorMode') || 'light';
}

function applyColorMode(mode) {
    document.body.classList.remove('mode-light', 'mode-dark');
    document.body.classList.add(mode === 'dark' ? 'mode-dark' : 'mode-light');

    const btn = document.getElementById('modeToggleBtn');
    if (btn) {
        btn.textContent = mode === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
    }
}

applyColorMode(getSavedColorMode());

const modeToggleBtn = document.getElementById('modeToggleBtn');
if (modeToggleBtn) {
    modeToggleBtn.addEventListener('click', function () {
        const nextMode = getSavedColorMode() === 'dark' ? 'light' : 'dark';
        localStorage.setItem('colorMode', nextMode);
        applyColorMode(nextMode);
    });
}
