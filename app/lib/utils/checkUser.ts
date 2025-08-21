import { useMemory } from "../../store/store";

export default async function checkUser() {
  const { username } = useMemory.getState();
  return username;
}
