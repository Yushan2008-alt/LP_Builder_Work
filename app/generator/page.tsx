import { redirect } from "next/navigation";

export default function GeneratorRootPage() {
  redirect("/generator/new");
}
