import { redirect } from "next/navigation";

/* /es/embreve mostrava o site de vendas em espanhol, com preço em real e
   o checkout brasileiro. Até o espanhol ter preço, checkout e lojas
   próprios, quem chega aqui vai para /es ("próximamente"). */

export default function Page() {
  redirect("/es");
}
