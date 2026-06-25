import React from 'react';

export default function GestionClientes() {
  const clientesDummy = [
    { id: 4, nombre: 'Carlos Mendoza', certificado: 'Advanced Open Water', agencia: 'PADI' },
    { id: 5, nombre: 'Ana María Restrepo', certificado: 'Open Water', agencia: 'SSI' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Base de Datos de Buceadores</h2>
          <p className="text-sm text-slate-500">Gestión de certificaciones y formularios médicos</p>
        </div>
        <button className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-all">
          + Nuevo Cliente
        </button>
      </div>
      <table className="w-full text-left border-collapse text-sm text-slate-600">
        <thead>
          <tr className="bg-slate-50 text-slate-700 uppercase text-xs font-bold border-b border-slate-100">
            <th className="p-3">ID</th>
            <th className="p-3">Nombre Completo</th>
            <th className="p-3">Agencia</th>
            <th className="p-3">Nivel Certificación</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {clientesDummy.map(c => (
            <tr key={c.id} className="hover:bg-slate-50/80">
              <td className="p-3 font-mono text-slate-400">#{c.id}</td>
              <td className="p-3 font-semibold text-slate-800">{c.nombre}</td>
              <td className="p-3">{c.agencia}</td>
              <td className="p-3"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">{c.certificado}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}