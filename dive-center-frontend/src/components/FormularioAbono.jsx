import React, { useState, useEffect } from 'react';

export default function FormularioAbono() {
  const [viajeId, setViajeId] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [montoOriginal, setMontoOriginal] = useState('');
  const [monedaOriginal, setMonedaOriginal] = useState('COP');
  const [trmDigitada, setTrmDigitada] = useState('1');
  const [medio, setMedio] = useState('Transferencia');
  const [cuentaDestino, setCuentaDestino] = useState('Cuenta de Ahorros Principal');
  const [descripcion, setDescripcion] = useState('');

  const [viajesActivos] = useState([
    { id: 1, destino: 'Coiba, Panamá - Julio 2026' },
    { id: 2, destino: 'Mar Rojo - Octubre 2027' }
  ]);

  const [clientes] = useState([
    { id: 4, nombre: 'Carlos Mendoza', identificacion: '10203040' },
    { id: 5, nombre: 'Ana María Restrepo', identificacion: '98765432' }
  ]);

  useEffect(() => {
    if (monedaOriginal === 'COP') {
      setTrmDigitada('1');
    } else {
      setTrmDigitada('');
    }
  }, [monedaOriginal]);

  const montoCalculadoCop = parseFloat(montoOriginal || 0) * parseFloat(trmDigitada || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Enviando abono...');
  };

  return (
    <div className="max-w-2xl mx-auto my-8 bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100 font-sans">
      <div className="bg-gradient-to-r border-b border-blue-100 bg-blue-50 px-6 py-5">
        <h2 className="text-xl font-bold text-blue-950">Registrar Abono de Cliente</h2>
        <p className="text-sm text-slate-500 mt-1">Módulo de recaudo y control financiero para expediciones</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 text-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Seleccionar Viaje</label>
            <select value={viajeId} onChange={(e) => setViajeId(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-sm" required>
              <option value="">-- Seleccione un viaje --</option>
              {viajesActivos.map(v => <option key={v.id} value={v.id}>{v.destino}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Buceador / Cliente</label>
            <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-sm" required>
              <option value="">-- Seleccione el cliente --</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Divisa del Pago</label>
          <div className="grid grid-cols-3 gap-3">
            {['COP', 'USD', 'EUR'].map((moneda) => (
              <label key={moneda} className={`flex items-center justify-center py-3 border rounded-xl cursor-pointer font-bold text-sm transition-all ${monedaOriginal === moneda ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-50'}`}>
                <input type="radio" name="monedaOriginal" value={moneda} checked={monedaOriginal === moneda} onChange={(e) => setMonedaOriginal(e.target.value)} className="sr-only" />
                {moneda}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Monto Original</label>
            <input type="number" step="0.01" value={montoOriginal} onChange={(e) => setMontoOriginal(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">TRM del Día</label>
            <input type="number" step="0.01" value={trmDigitada} onChange={(e) => setTrmDigitada(e.target.value)} disabled={monedaOriginal === 'COP'} className={`w-full px-3 py-2 border rounded-lg text-sm ${monedaOriginal === 'COP' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white'}`} required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Medio de Pago</label>
            <select value={medio} onChange={(e) => setMedio(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Cuenta Destino</label>
            <select value={cuentaDestino} onChange={(e) => setCuentaDestino(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="Cuenta de Ahorros Principal">Cuenta de Ahorros Principal</option>
              <option value="ARD Dollar App">ARD Dollar App</option>
              <option value="Caja Menor">Caja Menor</option>
            </select>
          </div>
        </div>

        <div className="p-4 bg-slate-900 rounded-xl text-white flex justify-between items-center shadow-inner">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Total Consolidado</span>
            <h3 className="text-sm font-medium text-slate-200">Monto Calculado en COP</h3>
          </div>
          <span className="text-2xl font-black text-emerald-400 font-mono">
            $ {montoCalculadoCop.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all">
          Guardar Registro Financiero
        </button>
      </form>
    </div>
  );
}