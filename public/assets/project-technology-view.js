// Interpreta somente vínculos próprios de cada projeto, nunca a vitrine global ou tags genéricas.
// Se uma resposta antiga trouxe apenas IDs, a biblioteca de tecnologias completa resolve os nomes.
export function resolveProjectTechnologies(project, catalog = []) {
  const safeItems = items => Array.isArray(items) ? items : [];
  const current = new Map(safeItems(catalog).filter(t => t && typeof t.id === 'string').map(t => [t.id, t]));
  const snapshots = new Map(safeItems(project?.technologySnapshots).filter(t => t && typeof t.id === 'string').map(t => [t.id, t]));
  const returned = safeItems(project?.technologies).map(t => typeof t === 'string' ? {label:t} : t).filter(t => t && typeof t === 'object' && typeof t.label === 'string');
  const fromResponse = new Map(returned.filter(t => typeof t.id === 'string').map(t => [t.id, t]));
  const explicitIds = Array.isArray(project?.technologyIds) ? project.technologyIds.filter(id => typeof id === 'string') : null;
  const records = explicitIds !== null
    ? explicitIds.map(id => current.get(id) || fromResponse.get(id) || snapshots.get(id)).filter(Boolean)
    : returned.length ? returned.map(t => t.id ? current.get(t.id) || t : t) : [...snapshots.values()];
  const seen = new Set();
  return records.filter(t => {
    const key = t.id || t.label.trim().toLocaleLowerCase('pt-BR');
    if (!t.label?.trim() || seen.has(key)) return false;
    seen.add(key);return true;
  }).slice(0, 30).map(t => ({
    id: String(t.id || ''),label:String(t.label).trim().slice(0,64),
    logoUrl:typeof t.logoUrl === 'string' ? t.logoUrl : '',
    icon:typeof t.icon === 'string' ? t.icon.slice(0,12) : '',
    color:/^#[0-9a-f]{6}$/i.test(t.color || '') ? t.color : '#B7FF79'
  }));
}
