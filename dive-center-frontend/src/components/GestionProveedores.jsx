import React from 'react';

export default function GestionProveedores() {
  const proveedoresDummy = [
    { id: 1, nombre: 'Hospedaje del Mar', servicio: 'Hospedaje', contacto: 'Lorena' },
    { id: 2, nombre: 'Operador Botes Coiba', servicio: 'Transporte Marítimo', contacto: 'Cap. Juan' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Proveedores Aliados</h2>
          <p className="text-sm text-slate-500">Logística de hospedaje, botes y alimentación</p>
        </div>
        <button className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-all">
          + Nuevo Proveedor
        </button>
      </div>
      <table className="w-full text-left border-collapse text-sm text-slate-600">
        <thead>
          <tr className="bg-slate-50 text-slate-700 uppercase text-xs font-bold border-b border-slate-100">
            <th className="p-3">ID</th>
            <th className="p-3">Nombre Comercial</th>
            <th className="p-3">Tipo Servicio</th>
            <th className="p-3">Contacto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {proveedoresDummy.map(p => (
            <tr key={p.id} className="hover:bg-slate-50/80">
              <td className="p-3 font-mono text-slate-400">#{p.id}</td>
              <td className="p-3 font-semibold text-slate-800">{p.nombre}</td>
              <td className="p-3">{p.servicio}</td>
              <td className="p-3 text-slate-500">{p.contacto}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}