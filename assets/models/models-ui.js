(() => {
  const models = window.FMV_MODELOS || [];
  const card = (model) => {
    const article = document.createElement('article');
    article.className = 'model-card';
    const image = document.createElement('img');
    image.src = model.imagen; image.alt = `Vista previa demostrativa de ${model.nombre}`; image.loading = 'lazy';
    const body = document.createElement('div'); body.className = 'model-card-body';
    const category = document.createElement('span'); category.className = 'model-category'; category.textContent = model.categoria;
    const title = document.createElement('h3'); title.textContent = model.nombre;
    const description = document.createElement('p'); description.textContent = model.descripcion;
    const features = document.createElement('ul'); features.className = 'model-features';
    model.funciones.slice(0, 3).forEach((value) => { const item = document.createElement('li'); item.textContent = value; features.append(item); });
    const meta = document.createElement('div'); meta.className = 'model-meta';
    const price = document.createElement('span'); price.textContent = model.precio;
    const time = document.createElement('span'); time.textContent = model.tiempoEntrega; meta.append(price, time);
    const actions = document.createElement('div'); actions.className = 'model-actions';
    const view = document.createElement('a'); view.className = 'model-button'; view.href = model.enlaceDemostracion; view.textContent = 'Ver modelo';
    const want = document.createElement('a'); want.className = 'model-button primary'; want.href = `/portal-comercial.html?modelo=${encodeURIComponent(model.slug)}`; want.textContent = 'Quiero este modelo';
    actions.append(view, want); body.append(category, title, description, features, meta, actions); article.append(image, body); return article;
  };

  const render = (target, values) => {
    target.replaceChildren();
    if (!values.length) { const empty = document.createElement('p'); empty.className = 'models-empty'; empty.textContent = 'No encontramos modelos con esos criterios. Prueba otra búsqueda o categoría.'; target.append(empty); return; }
    values.forEach((model) => target.append(card(model)));
  };

  const featured = document.querySelector('[data-models-featured]');
  if (featured) render(featured, models.filter((model) => model.destacado).slice(0, 3));

  const catalog = document.querySelector('[data-models-catalog]');
  if (catalog) {
    const search = document.querySelector('[data-models-search]');
    const filter = document.querySelector('[data-models-filter]');
    [...new Set(models.map((model) => model.categoria))].sort().forEach((category) => {
      const option = document.createElement('option'); option.value = category; option.textContent = category; filter.append(option);
    });
    const update = () => {
      const term = search.value.trim().toLocaleLowerCase('es');
      render(catalog, models.filter((model) => (!filter.value || model.categoria === filter.value) && (!term || `${model.nombre} ${model.categoria} ${model.descripcion}`.toLocaleLowerCase('es').includes(term))));
    };
    search.addEventListener('input', update); filter.addEventListener('change', update); update();
  }

  const demo = document.querySelector('[data-model-demo]');
  if (demo) {
    const slug = location.pathname.split('/').filter(Boolean).pop();
    const model = models.find((item) => item.slug === slug);
    if (!model) { location.replace('/modelos'); return; }
    const themes = { psicologia:['#f5efe5','#24342e','#3e7b6b'],joyeria:['#f4efe7','#241f1b','#9a6b2f'],restaurante:['#f3eadb','#302218','#a64b2a'],serviteca:['#edf1f3','#15232c','#d8532b'],maquillaje:['#f8eef2','#35252d','#a95676'] };
    const [bg,text,accent] = themes[model.slug]; document.documentElement.style.setProperty('--demo-bg',bg); document.documentElement.style.setProperty('--demo-text',text); document.documentElement.style.setProperty('--demo-accent',accent);
    document.title = `${model.nombre} · Modelo demostrativo | FMV InfraSec`;
    document.querySelector('[data-demo-category]').textContent = model.categoria;
    document.querySelector('[data-demo-name]').textContent = model.nombre;
    document.querySelector('[data-demo-description]').textContent = model.descripcion;
    const preview = document.querySelector('[data-demo-image]'); preview.src = model.imagen; preview.alt = `Vista previa de ${model.nombre}`;
    const list = document.querySelector('[data-demo-features]'); model.funciones.forEach((value, index) => { const item = document.createElement('article'); item.className='demo-feature'; const strong=document.createElement('strong'); strong.textContent=String(index+1).padStart(2,'0'); const p=document.createElement('p'); p.textContent=value; item.append(strong,p); list.append(item); });
    document.querySelectorAll('[data-demo-want]').forEach((link) => { link.href = `/portal-comercial.html?modelo=${encodeURIComponent(model.slug)}`; });
  }
})();
