/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { t } from '@apache-superset/core/translation';
import { SupersetClient, JsonResponse } from '@superset-ui/core';
import { Select, type SelectOptionsType } from '@superset-ui/core/components';

interface DatasourceOption {
  id: number;
  table_name: string;
  database: { database_name: string };
  schema: string;
}

interface SecondaryDatasourceControlProps {
  actions: { setControlValue: (key: string, value: unknown) => void };
  onChange: (value: string | undefined) => void;
  value?: string;
}

const DATASOURCE_API_PAGE_SIZE = 100;

const SecondaryDatasourceControl = ({
  actions,
  onChange,
  value,
}: SecondaryDatasourceControlProps) => {
  const [options, setOptions] = useState<SelectOptionsType>([]);
  const [loaded, setLoaded] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (!loaded) {
      SupersetClient.get({
        endpoint: `/api/v1/dataset/?q=${encodeURIComponent(
          JSON.stringify({
            columns: ['id', 'table_name', 'database.database_name', 'schema'],
            page_size: DATASOURCE_API_PAGE_SIZE,
            order_column: 'table_name',
            order_direction: 'asc',
          }),
        )}`,
      })
        .then((response: JsonResponse) => {
          const items: DatasourceOption[] = response.json?.result ?? [];
          setOptions(
            items.map(item => ({
              value: `${item.id}__table`,
              label: [
                item.table_name,
                item.schema,
                item.database?.database_name,
              ]
                .filter(Boolean)
                .join(' - '),
            })),
          );
        })
        .finally(() => setLoaded(true));
    }
  }, [loaded]);

  const fetchDatasourceMetadata = useCallback(
    (datasourceKey: string) => {
      const [idStr] = datasourceKey.split('__');
      const id = Number(idStr);
      if (Number.isNaN(id)) return;

      SupersetClient.get({
        endpoint: `/api/v1/dataset/${id}`,
      }).then((response: JsonResponse) => {
        const dataset = response.json?.result;
        if (dataset) {
          actions.setControlValue('datasource_b_data', {
            columns: dataset.columns ?? [],
            metrics: dataset.metrics ?? [],
            datasource_name: dataset.table_name,
          });
        }
      });
    },
    [actions],
  );

  useEffect(() => {
    if (value && value !== prevValueRef.current) {
      fetchDatasourceMetadata(value);
    }
    if (!value && prevValueRef.current) {
      actions.setControlValue('datasource_b_data', null);
    }
    prevValueRef.current = value;
  }, [value, fetchDatasourceMetadata, actions]);

  useEffect(() => {
    if (value && loaded) {
      fetchDatasourceMetadata(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const handleChange = (val: unknown) => {
    if (val && typeof val === 'object' && 'value' in val) {
      onChange((val as { value: string }).value);
    } else if (typeof val === 'string') {
      onChange(val);
    } else {
      onChange(undefined);
    }
  };

  return (
    <div>
      <Select
        allowClear
        ariaLabel={t('Secondary dataset')}
        value={value}
        mode="single"
        onChange={handleChange}
        options={options}
        placeholder={t('Same as primary dataset')}
      />
    </div>
  );
};

export default SecondaryDatasourceControl;
