export default `# sample profiles YAML file for dbt CLI (https://docs.getdbt.com/reference/profiles.yml)
{{profile}}:
  target: dev
  outputs:
    dev:
      type: bigquery
      threads: 8
      method: oauth # using gcloud (https://docs.getdbt.com/reference/warehouse-setups/bigquery-setup#oauth-via-gcloud)
      project: {{project}}
      dataset: {{dataset}}_dev
      timeout_seconds: 300
`;
