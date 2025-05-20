import { useState, useEffect } from 'react';
import { ButtonHubConfig } from '../types/buttonTypes.ts';
import configData from '../config/buttonConfig.json';

export const useButtonConfig = (configKey: 'chiffrage' | 'produits' | 'conseils') => {
  const [config, setConfig] = useState<ButtonHubConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setConfig(configData[configKey] as ButtonHubConfig);
      setLoading(false);
    } catch (err) {
      setError('Failed to load button configuration');
      setLoading(false);
    }
  }, [configKey]);

  return { config, loading, error };
};