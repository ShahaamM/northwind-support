import React from 'react';
import type { SlaStatus } from '../../../types/api';
import { Badge } from '../../../components/Badge';

interface SlaCellProps {
  slaStatus: SlaStatus;
  dueAtUtc?: string | null;
}

export const SlaCell: React.FC<SlaCellProps> = ({ slaStatus }) => {
  switch (slaStatus) {
    case 'Met':
      return <Badge variant="success">Met (SLA Achieved)</Badge>;
    case 'Breached':
      return <Badge variant="danger">Breached (SLA Overdue)</Badge>;
    case 'AtRisk':
      return <Badge variant="warning">At Risk (Due Soon)</Badge>;
    case 'WithinSla':
      return <Badge variant="info">Within SLA</Badge>;
    case 'NotApplicable':
    default:
      return <span className="text-gray-400">No SLA</span>;
  }
};
