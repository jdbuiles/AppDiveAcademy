import React, { useState } from 'react';
import FormularioAbono from './components/FormularioAbono';
import GestionClientes from './components/GestionClientes';
import GestionProveedores from './components/GestionProveedores';

function App() {
  // Estado para controlar qué pantalla se renderiza en la sección principal
  const [vistaActual, setVistaActual] = useState('abonos');

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans antialiased text-slate-800">
      
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800 bg-slate-950">
          <h1 className="text-lg font-black tracking-wider text-blue-400">DIVE ACADEMY</h1>
          <p className="text-xs text-slate-400 uppercase font-semibold mt-0.5">Centro de Control</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setVistaActual('abonos')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-sm transition-all text-left
              ${vistaActual === 'abonos' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            💳 Registrar Abono
          </button>

          <button
            onClick={() => setVistaActual('clientes')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-sm transition-all text-left
              ${vistaActual === 'clientes' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            👥 Gestión Clientes
          </button>

          <button
            onClick={() => setVistaActual('proveedores')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-sm transition-all text-left
              ${vistaActual === 'proveedores' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            🏢 Gestión Proveedores
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950 text-xs text-slate-500 text-center">
          Sistema v1.0.0 © 2026
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {vistaActual === 'abonos' && <FormularioAbono />}
          {vistaActual === 'clientes' && <GestionClientes />}
          {vistaActual === 'proveedores' && <GestionProveedores />}
        </div>
      </main>

    </div>
  );
}

export default App;