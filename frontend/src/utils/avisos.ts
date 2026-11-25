import { notifications } from '@mantine/notifications';
import { ApiError } from '../api/cliente';

export function avisarErro(erro: unknown, titulo: string): void {
  const mensagem = erro instanceof ApiError ? erro.message : 'Erro inesperado. Tente novamente.';
  notifications.show({ color: 'red', title: titulo, message: mensagem });
}

export function avisarSucesso(mensagem: string): void {
  notifications.show({ color: 'teal', message: mensagem });
}