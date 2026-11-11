(() => {
  const slug = new URLSearchParams(location.search).get('modelo');
  const model = (window.FMV_MODELOS || []).find((item) => item.slug === slug);
  if (!model) return;

  const notice = document.createElement('aside');
  notice.className = 'card';
  notice.style.cssText = 'width:min(1080px,100%);margin:0 auto 24px;border-color:var(--cyan)';
  const label = document.createElement('strong');
  label.textContent = `Interés registrado: modelo ${model.nombre}`;
  const detail = document.createElement('p');
  detail.className = 'meta';
  detail.textContent = `Categoría ${model.categoria}. Inicia sesión o crea una cuenta para solicitar una asesoría y personalizarlo.`;
  notice.append(label, detail);
  document.querySelector('.layout')?.before(notice);

  const objective = document.getElementById('objective');
  if (objective && !objective.value) objective.value = model.mensajeWhatsApp;
})();
