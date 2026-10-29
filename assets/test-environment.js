(() => {
  if (!window.location.hostname.startsWith('test-')) return;

  const banner = document.createElement('div');
  banner.id = 'test-environment-banner';
  banner.setAttribute('role', 'status');
  banner.innerHTML = '<strong>Entorno de prueba · Los cambios aquí aún no están en producción</strong>';

  const style = document.createElement('style');
  style.textContent = `
    :root { --test-banner-height: 44px; }
    body { padding-top: var(--test-banner-height) !important; }
    .top { top: var(--test-banner-height) !important; }
    #test-environment-banner {
      position: fixed;
      inset: 0 0 auto 0;
      z-index: 2147483647;
      min-height: var(--test-banner-height);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 9px 20px;
      background: #fbbf24;
      color: #241600;
      border-bottom: 2px solid #f59e0b;
      box-shadow: 0 4px 16px rgba(0, 0, 0, .28);
      font: 700 14px/1.25 "Segoe UI", Arial, sans-serif;
      text-align: center;
    }
    @media (max-width: 560px) {
      :root { --test-banner-height: 58px; }
      #test-environment-banner { font-size: 12px; padding-inline: 12px; }
    }
  `;

  document.head.appendChild(style);
  document.body.prepend(banner);
})();
