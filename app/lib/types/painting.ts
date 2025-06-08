import {supabase} from "./client";

export interface Painting {
    painting_id: string;
    name: string;
    images: string[];
    acquire_date: string;
    category: string;
    owner: string;
    status?: string;
}

export async function getPainting(paintingId: string): Promise<Painting> {
    const {data, error} = await supabase
        .from("Painting")
        .select(
            "painting_id, name, image, acquire_date, category, owner, status,at_work, price, working_time, is_for_trade, is_for_rent, is_rented, rented_by, rental_end_date, rental_price"
        )
        .eq("painting_id", paintingId)
        .single();

    if (error) throw new Error(`Failed to get painting: ${error.message}`);
    return data as Painting;
}
