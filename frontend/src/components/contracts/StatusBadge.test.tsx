import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('mostra o rótulo em português para cada status', () => {
    const { rerender } = render(<StatusBadge status="ATIVO" />);
    expect(screen.getByText('Ativo')).toBeInTheDocument();

    rerender(<StatusBadge status="VENCIDO" />);
    expect(screen.getByText('Vencido')).toBeInTheDocument();

    rerender(<StatusBadge status="ENCERRADO" />);
    expect(screen.getByText('Encerrado')).toBeInTheDocument();
  });
});
