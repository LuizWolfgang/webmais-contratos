import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as contractsService from '../services/contracts.service';
import { extractErrorMessage } from '../services/api';
import type { Contract, ContractInput, ContractsSummary } from '../types/contract';

const POLL_INTERVAL_MS = 10_000;

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [summary, setSummary] = useState<ContractsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [contractsData, summaryData] = await Promise.all([
        contractsService.listContracts(),
        contractsService.getContractsSummary(),
      ]);
      setContracts(contractsData);
      setSummary(summaryData);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // recarrega periodicamente para refletir a transição automática Ativo -> Vencido feita pelo worker
    const timer = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  async function create(input: ContractInput) {
    await contractsService.createContract(input);
    toast.success('Contrato cadastrado com sucesso');
    await refresh();
  }

  async function update(id: string, input: ContractInput) {
    await contractsService.updateContract(id, input);
    toast.success('Contrato atualizado com sucesso');
    await refresh();
  }

  async function remove(id: string) {
    try {
      await contractsService.deleteContract(id);
      toast.success('Contrato excluído com sucesso');
      await refresh();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  async function close(id: string) {
    try {
      await contractsService.closeContract(id);
      toast.success('Contrato encerrado com sucesso');
      await refresh();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  return { contracts, summary, isLoading, create, update, remove, close, refresh };
}
