import { redirect } from "next/navigation";

/* /em-breve existiu por algumas horas como endereço da lista de espera.
   Agora a lista é a home. Qualquer link que já tenha saído com esse
   endereço continua funcionando. */

export default function Page() {
  redirect("/");
}
