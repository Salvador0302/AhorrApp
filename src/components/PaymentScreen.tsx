import React, { useState } from 'react';
import { formatCurrency } from '../utils/currency';
import { CreditCard, DollarSign, CheckCircle, ArrowLeft, Download, Shield } from 'lucide-react';
import type { Screen } from '../App';

interface Receipt {
  id: string;
  period: string;
  consumption: number;
  amount: number;
  dueDate: string;
  previousConsumption?: number;
  image?: string;
}

interface PaymentScreenProps {
  receipt: Receipt | null;
  onNavigate: (screen: Screen) => void;
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({ receipt, onNavigate }) => {
  const [paymentStep, setPaymentStep] = useState<'details' | 'payment' | 'success'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!receipt) {
    return (
      <div className="p-4 text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">
          No hay recibo para pagar
        </h3>
        <p className="text-white/70 text-sm mb-4">
          Primero sube tu recibo de luz para poder procesarlo
        </p>
        <button
          onClick={() => onNavigate('receipt')}
          className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold py-2 px-6 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all"
        >
          Subir Recibo
        </button>
      </div>
    );
  }

  const originalAmount = receipt.amount;
  const managementFee = originalAmount * 0.10; // 10% commission
  const savings = managementFee;
  const totalToPay = originalAmount;

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentStep('success');
    }, 3000);
  };

  if (paymentStep === 'success') {
    return (
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-xl font-bold text-white">Pago Exitoso</h2>
        </div>

        {/* Success Message */}
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-white font-bold text-2xl mb-2">¡Pago Realizado!</h3>
          <p className="text-white/70 text-sm">
            Tu recibo ha sido pagado exitosamente
          </p>
        </div>

        {/* Payment Receipt */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6">
          <h4 className="text-white font-semibold text-lg mb-4 text-center">Comprobante de Pago</h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-white/70">Período</span>
              <span className="text-white font-medium">{receipt.period}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-white/70">Consumo</span>
              <span className="text-white font-medium">{receipt.consumption} kWh</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-white/70">Monto Original</span>
              <span className="text-white font-medium">{formatCurrency(originalAmount)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-green-400">Ahorro Gestionado</span>
              <span className="text-green-400 font-medium">-{formatCurrency(savings)}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 bg-green-500/10 rounded-lg px-3">
              <span className="text-white font-semibold">Total Pagado</span>
              <span className="text-white font-bold text-xl">{formatCurrency(totalToPay)}</span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="text-center text-xs text-white/60">
              <p>Fecha: {new Date().toLocaleDateString('es-ES')}</p>
              <p>Referencia: AH{Date.now().toString().slice(-8)}</p>
              <p>Estado: Pagado ✓</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button className="w-full bg-blue-500/20 border border-blue-400/30 text-blue-400 font-medium py-3 rounded-xl hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Descargar Comprobante
          </button>
          
          <button
            onClick={() => onNavigate('history')}
            className="w-full bg-white/10 border border-white/20 text-white font-medium py-3 rounded-xl hover:bg-white/20 transition-all"
          >
            Ver Historial de Pagos
          </button>
        </div>

        {/* Savings Info */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-md rounded-xl border border-green-400/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium">Ahorro Gestionado</span>
          </div>
          <p className="text-white/80 text-sm">
            Hemos gestionado un ahorro del 10% ({formatCurrency(savings)}) que se aplicará a tu próxima factura. 
            ¡Sigue usando AhorraPE para maximizar tus ahorros!
          </p>
        </div>
      </div>
    );
  }

  if (paymentStep === 'payment') {
    return (
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPaymentStep('details')}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-xl font-bold text-white">Método de Pago</h2>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold">Selecciona tu método de pago</h3>
          
          <div className="space-y-2">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`w-full p-4 rounded-xl border transition-all flex items-center gap-3 ${
                paymentMethod === 'card'
                  ? 'bg-blue-500/20 border-blue-400/30 text-white'
                  : 'bg-white/10 border-white/20 text-white/70'
              }`}
            >
              <CreditCard className="w-6 h-6" />
              <div className="text-left">
                <p className="font-medium">Tarjeta de Crédito/Débito</p>
                <p className="text-sm opacity-70">Visa, Mastercard, American Express</p>
              </div>
            </button>
            
            <button
              onClick={() => setPaymentMethod('transfer')}
              className={`w-full p-4 rounded-xl border transition-all flex items-center gap-3 ${
                paymentMethod === 'transfer'
                  ? 'bg-blue-500/20 border-blue-400/30 text-white'
                  : 'bg-white/10 border-white/20 text-white/70'
              }`}
            >
              <DollarSign className="w-6 h-6" />
              <div className="text-left">
                <p className="font-medium">Transferencia Bancaria</p>
                <p className="text-sm opacity-70">Desde tu cuenta bancaria</p>
              </div>
            </button>
          </div>
        </div>

        {/* Payment Form */}
        {paymentMethod === 'card' && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4 space-y-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Número de Tarjeta</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/80 text-sm mb-2">Vencimiento</label>
                <input
                  type="text"
                  placeholder="MM/AA"
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-2">CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-white/80 text-sm mb-2">Nombre del Titular</label>
              <input
                type="text"
                placeholder="Juan Pérez"
                className="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Security Info */}
        <div className="bg-green-500/10 backdrop-blur-md rounded-xl border border-green-400/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium">Pago Seguro</span>
          </div>
          <p className="text-white/80 text-sm">
            Tu información está protegida con encriptación de nivel bancario. 
            No almacenamos datos de tarjetas.
          </p>
        </div>

        {/* Process Payment */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Procesando...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pagar {formatCurrency(totalToPay)}
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('home')}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-xl font-bold text-white">Pagar Recibo</h2>
      </div>

      {/* Receipt Summary */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-400" />
          Resumen del Recibo
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <span className="text-white/70">Período</span>
            <span className="text-white font-medium">{receipt.period}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <span className="text-white/70">Consumo</span>
            <span className="text-white font-medium">{receipt.consumption} kWh</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <span className="text-white/70">Monto Original</span>
            <span className="text-white font-medium">{formatCurrency(originalAmount)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <span className="text-white/70">Vencimiento</span>
            <span className="text-white font-medium">
              {new Date(receipt.dueDate).toLocaleDateString('es-ES')}
            </span>
          </div>
        </div>
      </div>

      {/* AhorraPE Management */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-md rounded-xl border border-green-400/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-medium">Gestión AhorraPE</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-white/80 text-sm">Monto del recibo</span>
            <span className="text-white">{formatCurrency(originalAmount)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-green-400 text-sm">Ahorro gestionado (10%)</span>
            <span className="text-green-400">-{formatCurrency(savings)}</span>
          </div>
          
          <div className="border-t border-white/20 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold">Total a pagar</span>
              <span className="text-white font-bold text-xl">{formatCurrency(totalToPay)}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 p-3 bg-white/10 rounded-lg">
          <p className="text-white/80 text-xs">
            💡 <strong>¿Cómo funciona?</strong> Pagamos tu recibo completo y gestionamos un ahorro del 10% 
            que se aplicará a tu próxima factura. Tú pagas el monto original y nosotros optimizamos el resto.
          </p>
        </div>
      </div>

      {/* Payment Button */}
      <button
        onClick={() => setPaymentStep('payment')}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
      >
        <CreditCard className="w-5 h-5" />
        Proceder al Pago
      </button>

      {/* Benefits */}
      <div className="bg-blue-500/10 backdrop-blur-md rounded-xl border border-blue-400/20 p-4">
        <h4 className="text-blue-400 font-medium mb-2">Beneficios del Pago con AhorraPE</h4>
        <ul className="text-white/80 text-sm space-y-1">
          <li>✓ Gestión automática de ahorros</li>
          <li>✓ Pago seguro y encriptado</li>
          <li>✓ Historial completo de transacciones</li>
          <li>✓ Recomendaciones personalizadas</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentScreen;