import { redirect } from "next/navigation";

/* /embreve foi o endereço de trabalho do site de vendas enquanto a home
   era a lista de espera. Desde a virada, o site de vendas é a própria
   home: qualquer link que já tenha saído com /embreve cai em "/", e não
   sobra uma segunda cópia da página. */

export default function Page() {
  redirect("/");
}
