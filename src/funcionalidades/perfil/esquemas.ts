import { z } from 'zod'

export const esquemaEdicaoPerfil = z.object({
  nome: z
    .string()
    .trim()
    .min(2, 'Informe um nome com pelo menos 2 caracteres.')
    .max(80, 'O nome pode ter no máximo 80 caracteres.'),
})

export type EdicaoPerfil = z.infer<typeof esquemaEdicaoPerfil>

export const esquemaTrocaSenha = z
  .object({
    senhaAtual: z.string().min(1, 'Informe a senha atual.'),
    novaSenha: z.string().min(8, 'A nova senha precisa de pelo menos 8 caracteres.'),
    confirmacao: z.string().min(1, 'Repita a nova senha.'),
  })
  .refine((dados) => dados.novaSenha === dados.confirmacao, {
    message: 'A confirmação não corresponde à nova senha.',
    path: ['confirmacao'],
  })
  .refine((dados) => dados.novaSenha !== dados.senhaAtual, {
    message: 'A nova senha precisa ser diferente da atual.',
    path: ['novaSenha'],
  })

export type TrocaSenha = z.infer<typeof esquemaTrocaSenha>

export const TIPOS_AVATAR = ['image/jpeg', 'image/png', 'image/webp'] as const
export const TAMANHO_MAXIMO_AVATAR = 2 * 1024 * 1024 // 2 MB

/** Validação local do arquivo: erro de tipo/tamanho nem chega à API. */
export function validarArquivoAvatar(arquivo: File): string | null {
  if (!TIPOS_AVATAR.includes(arquivo.type as (typeof TIPOS_AVATAR)[number])) {
    return 'Formato inválido. Envie JPG, PNG ou WebP.'
  }
  if (arquivo.size > TAMANHO_MAXIMO_AVATAR) {
    return 'O arquivo excede 2 MB. Reduza a imagem e tente novamente.'
  }
  return null
}

/** Converte o arquivo validado em data URL para persistir no banco simulado. */
export function arquivoParaDataUrl(arquivo: File): Promise<string> {
  return new Promise((resolver, rejeitar) => {
    const leitor = new FileReader()
    leitor.onload = () => resolver(String(leitor.result))
    leitor.onerror = () => rejeitar(new Error('Falha ao ler o arquivo.'))
    leitor.readAsDataURL(arquivo)
  })
}
