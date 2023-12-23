import MakeRequest from '../lib/MakeRequest';

export class System {
  static async keys() {
    return MakeRequest('get', '/setup-complete')
      .then((data) => data.results)
      .catch(() => {
        return {
          MultiUserMode: null,
          RequiresAuth: null,
          OpenAiKey: false,
          AzureOpenAiKey: false,
        };
      });
  }
}
