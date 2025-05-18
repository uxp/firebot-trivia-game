
# Code of Conduct
First and foremost, all contributors and contributions are subject to our [community code of conduct](CODE_OF_CONDUCT.md). Any violations of the code of conduct are subject to the enforcement actions listed therein.

# Before You Begin
Before starting development on a new feature or fix, please ensure the following prerequisites are met:
- **Open Issue**: Any work must be associated with an open issue and any proposed changes must be as detailed as possible. This is crucial for us to understand what and how work is being done, along with any potential impacts to existing features. Always open an issue detailing the scope of work you wish to perform before submitting a pull request.

> [!WARNING]
> Any pull request submitted without a relevant issue or approval from code owners will likely be rejected.

# Working on Code

## Branches
All active development work is done against the `trunk` branch for now. When performing work, create a feature branch from the most recent `trunk` commit, then target the `trunk` branch when you create a pull request.

## Testing
Before opening a pull request, best-effort testing must be done to ensure changes work and do not break existing functionality. For new features, this includes full testing of the new feature code. For bug fixes, this includes testing that the fix fully resolves the relevant issue. In both cases, regression testing should be done to ensure that existing functionality continues to work as expected.

While unit tests are the most preferred, we understand this plugin architecture can be a hindrance. Provide clear instructions in your Bug Report or Pull Request on the steps you performed while testing your changes.


> [!WARNING]
> Pull requests with insufficient testing may be closed at the Code Owners discretion.

## Formatting
ESLint will handle most formatting concerns, so ensure that your editor is following those rules.

We use Unix-style end of line character (line feed `\n` or `\x0A`, not the Windows-style carriage return + line feed `\r\n`)

We use 4 spaces for indents.

# Opening Pull Requests

## Branch

As mentioned above, all pull requests must target the `trunk` branch.

## Title

Pull request titles should adhere to the following format:

> `type(scope): short description (#issue)`

- The `type` should be a lowercase value that follows the [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) format. Firebot specifically focuses on the following types:
    - `feat`: New/updated feature
    - `fix`: Bug fix
    - `chore`: Housekeeping items such as refactors, cleanup, or comments that do not change functionality.
- (Optional) The `scope` should include a single word to indicate what feature or area of the code this affects (e.g. `effects` or `chat`).
- The `short description` should be no more than a few words to describe the change.
- The `issue` field should be the primary issue number this change addresses, including the `#` sign and enclosed in parentheses (e.g. `(#1608)`).

The following are examples of well-formatted titles:
- `fix: change Save All effects dropdown to a dropup (#1804)`
- `feat(vars): add $isUserInChat (#2477)`
- `feat: multiline textarea in preset list args (#2399)`

## Description

When opening a pull request, ensure that the following information is included in the description:

- **Description of the Change**: Detail the change as much as possible, including any new, changed, and removed functionality.
- **Applicable Issues**: List any issues (i.e. feature requests or bug reports) related to this change.
- **Testing**: Detail all testing done for this pull request, including relevant testing steps, inputs, and outputs.
- **Screenshots**: For any work that makes changes to or can be verified in the UI, include screenshots of the updated functionality.

> [!WARNING]
> Pull requests missing any of the listed information above may be closed.

# Review Process

## Requested Changes

As part the review process, we may require changes if we believe they are needed to meet the vision & standards of the Code Owners. Some reasons for this include maintaining compatibility with previous versions, ensuring consistent user experience, etc. We may also suggest tweaks to simplify the code, make it more efficient, or make it easier to maintain long term.

*Please don't take this feedback personally.* We simply want this script to be the best that it can be for all of our users.
