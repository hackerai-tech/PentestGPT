import "server-only"
import { CodeInterpreter } from "@e2b/code-interpreter"

const sandboxTimeout = 10 * 60 * 1000 // 10 minutes in ms
const template = "code-interpreter-stateful"

export async function createOrConnectCodeInterpreter(userID: string) {
  const allSandboxes = await CodeInterpreter.list()

  const sandboxInfo = allSandboxes.find(
    sbx =>
      sbx.metadata?.userID === userID && sbx.metadata?.template === template
  )

  if (!sandboxInfo) {
    // Vercel's AI SDK has a bug that it doesn't throw an error in the tool `execute` call so we want to be explicit
    try {
      const sbx = await CodeInterpreter.create({
        metadata: {
          template,
          userID
        },
        timeoutMs: sandboxTimeout
      })

      return sbx
    } catch (e) {
      console.error("Error creating sandbox", e)
      throw e
    }
  }

  const sandbox = await CodeInterpreter.connect(sandboxInfo.sandboxID)
  await sandbox.setTimeout(sandboxTimeout)

  return sandbox
}

export async function executeCode(
  userID: string,
  code: string
): Promise<{
  results: string | null
  stdout: string
  stderr: string
  error: string | null
}> {
  const sbx = await createOrConnectCodeInterpreter(userID)

  try {
    const execution = await sbx.notebook.execCell(code, {
      timeoutMs: 60000
    })

    if (execution.error) {
      console.error(`[${userID}] Execution error:`, execution.error)
    }

    let formattedResults = null
    if (execution.results && execution.results.length > 0) {
      formattedResults = execution.results
        .map(result => (result.text ? result.text : JSON.stringify(result)))
        .join("\n")
    }

    return {
      results: formattedResults,
      stdout: execution.logs.stdout.join("\n"),
      stderr: execution.logs.stderr.join("\n"),
      error: execution.error ? formatFullError(execution.error) : null
    }
  } catch (error: any) {
    console.error(`[${userID}] Error in executeCode:`, error)

    return {
      results: null,
      stdout: "",
      stderr: "",
      error: formatFullError(error)
    }
  } finally {
    // TODO: This .close will be removed with the update to websocketless CodeInterpreter
    await sbx.close()
  }
}

function formatFullError(error: any): string {
  if (!error) return ""

  let output = ""
  if (error.name) output += `${error.name}: `
  if (error.value) output += `${error.value}\n\n`
  if (error.tracebackRaw && Array.isArray(error.tracebackRaw)) {
    output += error.tracebackRaw.join("\n")
  }
  return output.trim()
}
