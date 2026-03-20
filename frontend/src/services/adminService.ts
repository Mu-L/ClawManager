import api from './api';

export interface ResourceSummary {
  capacity: number;
  allocatable: number;
  requested: number;
  unit: string;
}

export interface NodeResourceDetail {
  name: string;
  ready: boolean;
  roles: string[];
  kubelet_version: string;
  internal_ip: string;
  pod_count: number;
  cpu: ResourceSummary;
  memory: ResourceSummary;
  disk: ResourceSummary;
}

export interface ClusterResourceOverview {
  node_count: number;
  ready_nodes: number;
  cpu: ResourceSummary;
  memory: ResourceSummary;
  disk: ResourceSummary;
  nodes: NodeResourceDetail[];
}

export const adminService = {
  getClusterResources: async (): Promise<ClusterResourceOverview> => {
    const response = await api.get('/system-settings/cluster-resources');
    return response.data.data;
  },
};
