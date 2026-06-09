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
import type { SerializableThemeConfig } from '@apache-superset/core/theme';

const HYPERWAVE_STORAGE_KEY = 'superset-hyperwave-enabled';

export const hyperwaveTheme: SerializableThemeConfig = {
  token: {
    colorPrimary: '#6d28d9',
    colorInfo: '#6d28d9',
    colorSuccess: '#059669',
    colorWarning: '#d97706',
    colorError: '#dc2626',
    colorLink: '#7c3aed',
    colorBgBase: '#0f0a1e',
    colorTextBase: '#e2e0f0',
  },
  algorithm: 'dark',
};

export function isHyperwaveEnabled(): boolean {
  try {
    return localStorage.getItem(HYPERWAVE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setHyperwaveEnabled(enabled: boolean): void {
  try {
    if (enabled) {
      localStorage.setItem(HYPERWAVE_STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(HYPERWAVE_STORAGE_KEY);
    }
  } catch {
    // localStorage unavailable
  }
}
