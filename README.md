# sauron
>This is the Master-ring, the One Ring to rule them all. This is the One Ring that he lost many ages ago, to the great weakening of his power. He greatly desires it — but he must not get it.
> 
An easy template clone cli made in Deno.

## INSTALL

```bash
deno install --unstable --allow-read --allow-write --allow-run -n sauron https://deno.land/x/sauronx/sauron.ts
```

## USAGE

Init a directory using a template.

```bash
sauron init DESTINATION --template TEMPLATE [OPTIONS]
# Example
sauron init hello-world --template https://github.com/alfredosalzillo/example-sauron-template
```

### Options
- _-t, --template_ - template to use (required)
- _--reload_ - reload the template if cached
- _--inputs.*_ - inputs to use within the template (Example --inputs.projectName hello-world)
- _-h, --help_ - show help

## Config file
Sauron searches, inside the template repository, for a config file named `sauron.yaml`.

The config file accept an `inputs` array of inputs to ask the user when using the template.

All the inputs accept the following options:

- `name` the input name to use inside files and dir/files names
- `type` the type of the input `question, choose, confirm` 
- `message` the message to show to the user asking for the input
- `default` **optional** the default value to use if user skip the question

The `name` could be used inside file name, directory name, and content of file and would be replaced with the value used by the user.
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
      - name: PROJECT_NAME
        type: question
        message: What is the project name?
    ```
- `choose` ask user to choose between options

    ```yaml
    inputs: 
      - name: PACKAGE_MANAGER
        type: choose
        message: What package manager want to use?
        values:
          - yarn
          - npm
    ```
- `confirm` ask user to confirm (yes|no) a question

    ```yaml
    inputs: 
      - name: TYPESCRIPT
        type: confirm
        message: Whant to use typescript?
        default: yes
    ```

---
`sauron` - a `Deno` to rule them all.
