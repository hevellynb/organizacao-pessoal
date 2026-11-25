import { Button, Group, Modal, Text } from '@mantine/core';

interface ConfirmarExclusaoProps {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  carregando: boolean;
  aoConfirmar: () => void;
  aoFechar: () => void;
}

export function ConfirmarExclusao({
  aberto,
  titulo,
  mensagem,
  carregando,
  aoConfirmar,
  aoFechar,
}: ConfirmarExclusaoProps) {
  return (
    <Modal opened={aberto} onClose={aoFechar} title={titulo} centered>
      <Text>{mensagem}</Text>
      <Group justify="flex-end" mt="lg">
        <Button variant="default" onClick={aoFechar}>
          Cancelar
        </Button>
        <Button color="red" loading={carregando} onClick={aoConfirmar}>
          Excluir
        </Button>
      </Group>
    </Modal>
  );
}