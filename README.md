# sauron
>This is the Master-ring, the One Ring to rule them all. This is the One Ring that he lost many ages ago, to the great weakening of his power. He greatly desires it — but he must not get it.
> 
An easy template clone cli made in Deno.

## INSTALL

```bash
deno install \
      --unstable \
      --allow-read \
      --allow-write \
      --allow-run \
      --allow-net \
      -n sauron https://deno.land/x/sauronx/sauron.ts
```

## USAGE

Init a directory using a template.

```bash
sauron init DESTINATION --template TEMPLATE [OPTIONS]
# Example with remote template
sauron init hello-world --template https://github.com/alfredosalzillo/example-sauron-template
# example with local template
sauron init hello-world --template /templates/hello-world
```

### Options
- _-t, --template_ - template to use (required)
- _-c, --config_ - override configuration, could be a path to a local file, an url or a JSON string
- _--reload_ - reload the template if cached
- _--inputs.*_ - inputs to use within the template (Example --inputs.projectName hello-world)
- _-h, --help_ - show help

## Configuration
Sauron searches, inside the template repository, for a config file named `sauron.yaml`.

### Inputs
The config file accept an `inputs` array of inputs to ask the user when using the template.

All the inputs accept the following options:

- `templateName` the input templateName to use inside files and dir/files names
- `type` the type of the input `question, choose, confirm` 
- `message` the message to show to the user asking for the input
- `default` **optional** the default value to use if user skip the question

The `templateName` could be used inside file templateName, directory templateName, and content of file and would be replaced with the value used by the user.
Variables should be used wrapped in double brackets without spaces `{{INPUT_NAME}}`.
Example:
```typescript 
// file: {{COMPONENT_NAME}}.tsx
import React from 'react';

const {{COMPONENT_NAME}} = () => <></>;

export default {{COMPONENT_NAME}};
```

Sauron support the following inputs type:
- `question` ask a question to the user

    ```yaml
    inputs: 
      - templateName: PROJECT_NAME
        type: question
        message: What is the project templateName?
    ```
- `choose` ask user to choose between options

    ```yaml
    inputs: 
      - templateName: PACKAGE_MANAGER
        type: choose
        message: What package manager want to use?
        values:
          - yarn
          - npm
    ```
- `confirm` ask user to confirm (yes|no) a question

    ```yaml
    inputs: 
      - templateName: TYPESCRIPT
        type: confirm
        message: Whant to use typescript?
        default: yes
    ```

### Other config
- `templateName` the template templateName
- `templateVersion` the template templateVersion
- `before` message to be logged before the copy of the template
- `after` message to be logged after the copy of the script, input variables can be used

### Global parameters

Some global parameters can be used like input variables:
- `DESTINATION` the destination argument
- `DESTINATION_BASENAME` the destination basename
- `TEMPLATE_NAME` the template name of the configuration file
- `TEMPLATE_VERSION` the template version of the configuration file
- `TEMPLATE` the template url/path argument

Example
```yaml
templateName: hello-sauron
templateVersion: 0.0.1
inputs:
  - templateName: PROJECT_NAME
    type: question
    message: What is the project templateName?
before: Using this awesome template made with sauron
after: |
  Project {{PROJECT_NAME}}@{{TEMPLATE_VERSION}} created successfully 
  run using 'deno run ./src/index.ts'
```
---
`sauron` - a `Deno` to rule them all.
