import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { Deal, DealPipeline, DealPipelineStage } from '../types';

interface PipelineResponse extends DealPipeline {
  stages: DealPipelineStage[];
}

interface KanbanResponse {
  pipeline: DealPipeline;
  stages: Array<DealPipelineStage & { deals: Deal[] }>;
}

export function KanbanPage() {
  const queryClient = useQueryClient();
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');

  const pipelinesQuery = useQuery({
    queryKey: ['pipelines'],
    queryFn: async () => {
      const response = await apiClient.get<PipelineResponse[]>('/pipelines');
      return response.data;
    },
  });

  const activePipelineId = useMemo(() => {
    if (selectedPipelineId) {
      return selectedPipelineId;
    }
    return pipelinesQuery.data?.[0]?.id ?? '';
  }, [selectedPipelineId, pipelinesQuery.data]);

  const kanbanQuery = useQuery({
    enabled: Boolean(activePipelineId),
    queryKey: ['kanban', activePipelineId],
    queryFn: async () => {
      const response = await apiClient.get<KanbanResponse>(
        `/pipelines/${activePipelineId}/kanban`,
      );
      return response.data;
    },
  });

  const moveDealMutation = useMutation({
    mutationFn: (payload: { dealId: string; stageId: string }) =>
      apiClient.patch(`/deals/${payload.dealId}`, { stageId: payload.stageId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban', activePipelineId] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });

  return (
    <section className="page">
      <div className="page-header">
        <h2>Воронка сделок</h2>
        <select
          value={activePipelineId}
          onChange={(event) => setSelectedPipelineId(event.target.value)}
        >
          {(pipelinesQuery.data ?? []).map((pipeline) => (
            <option key={pipeline.id} value={pipeline.id}>
              {pipeline.name}
            </option>
          ))}
        </select>
      </div>

      {kanbanQuery.isLoading ? <p>Загрузка канбана...</p> : null}
      {kanbanQuery.isError ? <p className="error">Не удалось загрузить воронку.</p> : null}

      <div className="kanban-board">
        {kanbanQuery.data?.stages.map((stage) => (
          <div key={stage.id} className="kanban-column">
            <div className="kanban-column-header">
              <strong>{stage.name}</strong>
              <span>{stage.deals.length}</span>
            </div>
            <div className="kanban-column-body">
              {stage.deals.map((deal) => (
                <article key={deal.id} className="kanban-card">
                  <Link to={`/deals/${deal.id}`}>{deal.title}</Link>
                  <p>{deal.amount ? `${deal.amount} ₽` : 'Без суммы'}</p>
                  <select
                    value={deal.stageId ?? stage.id}
                    onChange={(event) =>
                      moveDealMutation.mutate({
                        dealId: deal.id,
                        stageId: event.target.value,
                      })
                    }
                  >
                    {kanbanQuery.data.stages.map((targetStage) => (
                      <option key={targetStage.id} value={targetStage.id}>
                        {targetStage.name}
                      </option>
                    ))}
                  </select>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
