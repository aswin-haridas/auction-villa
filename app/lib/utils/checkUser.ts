export default async function checkUser() {
  const user_id =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return user_id;
}
