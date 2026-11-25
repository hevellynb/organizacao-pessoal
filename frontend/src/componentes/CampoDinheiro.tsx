import { NumberInput, type NumberInputProps } from '@mantine/core';

/** Campo numérico já configurado para reais: R$ 1.234,56 */
export function CampoDinheiro(props: NumberInputProps) {
  return (
    <NumberInput
      prefix="R$ "
      decimalSeparator=","
      thousandSeparator="."
      decimalScale={2}
      fixedDecimalScale
      min={0}
      allowNegative={false}
      {...props}
    />
  );
}