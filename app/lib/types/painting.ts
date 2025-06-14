export interface Painting {
  painting_id: string;
  name: string;
  images: string[];
  acquire_date: string;
  category: string;
  owner: string;
  status?: string;
}
