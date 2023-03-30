export default `# Name your project! Project names should contain only lowercase characters
# and underscores. A good package name should reflect your organization's
# name or the intended use of these models
name: '{{project_name}}'
version: '{{schema_version}}'
config-version: 2

# This setting configures which "profile" dbt uses for this project.
profile: '{{profile}}'

model-paths: ['models']
analysis-paths: ['analyses']
test-paths: ['tests']
seed-paths: ['seeds']
macro-paths: ['macros']
snapshot-paths: ['snapshots']

target-path: 'target' 
clean-targets: 
  - 'target'
  - 'dbt_packages'

models:
  {{profile}}:
    # Config indicated by + and applies to all files under models/example/
    +materialized: table
`;
