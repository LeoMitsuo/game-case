import { create } from 'zustand';

export type TipoToast = 'sucesso' | 'aviso' | 'erro';

type Aviso = {
  id: number;
  texto: string;
  tipo: TipoToast;
};

type EstadoToast = {
  aviso: Aviso | null;
  mostrar: (texto: string, tipo: TipoToast) => void;
  fechar: () => void;
};

export const useToast = create<EstadoToast>((set) => ({
  aviso: null,
  // O id garante que dois avisos iguais ainda sejam avisos diferentes,
  // reiniciando o cronômetro de dispensa automática.
  mostrar: (texto, tipo) => set({ aviso: { id: Date.now(), texto, tipo } }),
  fechar: () => set({ aviso: null }),
}));