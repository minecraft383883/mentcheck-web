export default function BloqueadoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Sistema temporalmente bloqueado
        </h1>
        <p className="text-gray-500 mb-6">
          El acceso a MentCheck se habilitará una vez que se confirme el pago de la licencia.
          Por favor contacta al administrador para más información.
        </p>
        <p className="text-sm text-gray-400">
          ¿Ya realizaste el pago? Escríbenos para activar tu acceso.
        </p>
      </div>
    </div>
  );
}
