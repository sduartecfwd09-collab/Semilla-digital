export interface Feria {
  id: string;
  nombre: string;
  direccion: string;
  provincia: string;
  dias: string;
  horario: string;
  source: "google" | "fallback" | "merged";
}
