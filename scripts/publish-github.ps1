param(
    [Parameter(Mandatory = $true)]
    [string]$AuthorName,
    [Parameter(Mandatory = $true)]
    [string]$AuthorEmail
)

$ErrorActionPreference = 'Stop'
$repositoryUrl = 'https://github.com/thwans/WORK-VITAL_E2E_TEST.git'
$projectRoot = Split-Path -Parent $PSScriptRoot
$gitCommand = Get-Command git.exe -ErrorAction SilentlyContinue
$gitExecutable = if ($gitCommand) { $gitCommand.Source } else { 'C:\Program Files\Git\cmd\git.exe' }
if (-not (Test-Path -LiteralPath $gitExecutable)) { throw 'Git executable not found.' }

function Invoke-ProjectGit {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$GitArguments)
    & $gitExecutable @GitArguments
    if ($LASTEXITCODE -ne 0) { throw "Git command failed (exit $LASTEXITCODE): git $($GitArguments -join ' ')" }
}

Push-Location -LiteralPath $projectRoot
try {
    if (-not (Test-Path -LiteralPath '.git')) { Invoke-ProjectGit init -b main }
    $branch = Invoke-ProjectGit symbolic-ref --short HEAD
    if ($branch -ne 'main') { throw "Expected main branch; found '$branch'. No branch was renamed." }

    Invoke-ProjectGit config --local user.name $AuthorName
    Invoke-ProjectGit config --local user.email $AuthorEmail
    $remotes = @(Invoke-ProjectGit remote)
    if ($remotes -contains 'origin') {
        $currentOrigin = Invoke-ProjectGit remote get-url origin
        if ($currentOrigin -ne $repositoryUrl) { throw "Origin differs from the requested repository: $currentOrigin" }
    } else {
        Invoke-ProjectGit remote add origin $repositoryUrl
    }

    # Inspect the remote before creating the initial project commit.
    Invoke-ProjectGit fetch origin
    $remoteBranches = @(Invoke-ProjectGit for-each-ref '--format=%(refname:short)' refs/remotes/origin)
    if ($remoteBranches.Count -gt 0) {
        throw "Remote branches already exist ($($remoteBranches -join ', ')). Review and integrate that history before publishing; nothing was pushed."
    }

    Invoke-ProjectGit add --all
    & $gitExecutable diff --cached --quiet
    $stagedDiffExitCode = $LASTEXITCODE
    if ($stagedDiffExitCode -eq 1) {
        Invoke-ProjectGit commit -m 'Set up WORK VITAL Playwright E2E tests'
    } elseif ($stagedDiffExitCode -ne 0) {
        throw "Unable to inspect staged changes (exit $stagedDiffExitCode)."
    }

    # No force push: existing remote history must never be overwritten.
    Invoke-ProjectGit push --set-upstream origin main
    Invoke-ProjectGit status --short --branch
} finally {
    Pop-Location
}
