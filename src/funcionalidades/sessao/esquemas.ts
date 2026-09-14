import { z } from 'zod'

export const esquemaEntrar = z.object({
  email: z.string().min(1, 'Informe o e-mail.').email('E-mail inválido.'),
  senha: z.string().min(8, 'A senha tem pelo menos 8 caracteres.'),
})

export type DadosEntrar = z.infer<typeof esquemaEntrar>

export const esquemaCadastro = z
  .object({
    nome: z.string().trim().min(2, 'Informe seu nome.'),
    email: z.string().min(1, 'Informe o e-mail.').email('E-mail inválido.'),
    senha: z.string().min(8, 'Crie uma senha com pelo menos 8 caracteres.'),
    confirmacaoSenha: z.string().min(1, 'Repita a senha.'),
  })
  .refine((dados) => dados.senha === dados.confirmacaoSenha, {
    message: 'As senhas não coincidem.',
    path: ['confirmacaoSenha'],
  })

export type DadosCadastro = z.infer<typeof esquemaCadastro>
