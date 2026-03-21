import SwiftUI
import WebKit

private enum ShellLoadState: Equatable {
  case loading
  case loaded
  case failed(String)

  var isLoading: Bool {
    if case .loading = self {
      return true
    }

    return false
  }
}

struct ContentView: View {
  @State private var loadState: ShellLoadState = .loading
  @State private var reloadToken = UUID()

  var body: some View {
    switch AppConfiguration.resolve() {
    case .success(let configuration):
      ZStack(alignment: .top) {
        WebContainerView(
          url: configuration.baseURL,
          loadState: $loadState,
          reloadToken: reloadToken,
        )
        .ignoresSafeArea()

        if loadState.isLoading {
          HStack(spacing: 10) {
            ProgressView()
              .progressViewStyle(.circular)
            Text("Loading OpenStore")
              .font(.subheadline.weight(.medium))
          }
          .padding(.horizontal, 14)
          .padding(.vertical, 10)
          .background(.ultraThinMaterial, in: Capsule())
          .padding(.top, 16)
        }

        if case .failed(let message) = loadState {
          FailureCard(
            title: "OpenStore could not load",
            message: message,
            urlString: configuration.baseURL.absoluteString,
            retry: {
              loadState = .loading
              reloadToken = UUID()
            }
          )
          .padding(.horizontal, 24)
        }
      }

    case .failure(let error):
      FailureCard(
        title: "OpenStore shell needs configuration",
        message: error.message,
        urlString: "Set OPENSTORE_BASE_URL in build settings or the run environment.",
        retry: nil,
      )
      .padding(24)
    }
  }
}

private enum AppConfiguration {
  struct ConfigurationError: Error {
    let message: String
  }

  struct ResolvedConfiguration {
    let baseURL: URL
  }

  static func resolve() -> Result<ResolvedConfiguration, ConfigurationError> {
    let environmentURL = ProcessInfo.processInfo.environment["OPENSTORE_BASE_URL"]
    let infoURL = Bundle.main.object(forInfoDictionaryKey: "OpenStoreBaseURL") as? String
    let rawURL = (environmentURL ?? infoURL ?? "").trimmingCharacters(in: .whitespacesAndNewlines)

    guard !rawURL.isEmpty else {
      return .failure(
        ConfigurationError(
          message:
            "No storefront URL is configured. Provide OPENSTORE_BASE_URL before launching the shell."
        )
      )
    }

    guard let url = URL(string: rawURL), let scheme = url.scheme else {
      return .failure(ConfigurationError(message: "The configured storefront URL is invalid: \(rawURL)"))
    }

    guard scheme == "http" || scheme == "https" else {
      return .failure(
        ConfigurationError(message: "The storefront URL must use http or https: \(rawURL)")
      )
    }

    return .success(ResolvedConfiguration(baseURL: url))
  }
}

private struct WebContainerView: UIViewRepresentable {
  let url: URL
  @Binding var loadState: ShellLoadState
  let reloadToken: UUID

  func makeCoordinator() -> Coordinator {
    Coordinator(loadState: $loadState)
  }

  func makeUIView(context: Context) -> WKWebView {
    let configuration = WKWebViewConfiguration()
    let webView = WKWebView(frame: .zero, configuration: configuration)

    webView.navigationDelegate = context.coordinator
    webView.allowsBackForwardNavigationGestures = true
    webView.scrollView.contentInsetAdjustmentBehavior = .never
    context.coordinator.reload(webView, url: url, reloadToken: reloadToken)

    return webView
  }

  func updateUIView(_ webView: WKWebView, context: Context) {
    guard context.coordinator.lastReloadToken != reloadToken || webView.url == nil else {
      return
    }

    context.coordinator.reload(webView, url: url, reloadToken: reloadToken)
  }

  final class Coordinator: NSObject, WKNavigationDelegate {
    @Binding private var loadState: ShellLoadState
    fileprivate var lastReloadToken: UUID?
    private var didEncounterFailure = false
    private var timeoutWorkItem: DispatchWorkItem?

    init(loadState: Binding<ShellLoadState>) {
      _loadState = loadState
    }

    func reload(_ webView: WKWebView, url: URL, reloadToken: UUID) {
      lastReloadToken = reloadToken
      didEncounterFailure = false
      loadState = .loading
      scheduleTimeout()
      webView.load(URLRequest(url: url))
    }

    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
      loadState = .loading
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
      cancelTimeout()

      guard !didEncounterFailure else {
        return
      }

      validateLoadedPage(webView)
    }

    func webView(
      _ webView: WKWebView,
      didFail navigation: WKNavigation!,
      withError error: Error,
    ) {
      handleFailure(error)
    }

    func webView(
      _ webView: WKWebView,
      didFailProvisionalNavigation navigation: WKNavigation!,
      withError error: Error,
    ) {
      handleFailure(error)
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
      handleFailure(message: "The embedded browser process stopped before OpenStore finished loading.")
    }

    private func handleFailure(_ error: Error) {
      let nsError = error as NSError

      if nsError.domain == NSURLErrorDomain && nsError.code == NSURLErrorCancelled {
        return
      }

      handleFailure(
        message:
          "Start the local web server or override OPENSTORE_BASE_URL, then retry. \(nsError.localizedDescription)"
      )
    }

    private func handleFailure(message: String) {
      cancelTimeout()
      didEncounterFailure = true
      loadState = .failed(
        message
      )
    }

    private func scheduleTimeout() {
      cancelTimeout()

      let workItem = DispatchWorkItem { [weak self] in
        guard let self, !self.didEncounterFailure else {
          return
        }

        self.didEncounterFailure = true
        self.loadState = .failed(
          "OpenStore took too long to respond. Start the local web server or override OPENSTORE_BASE_URL, then retry."
        )
      }

      timeoutWorkItem = workItem
      DispatchQueue.main.asyncAfter(deadline: .now() + 8, execute: workItem)
    }

    private func validateLoadedPage(_ webView: WKWebView) {
      webView.evaluateJavaScript("document.body ? document.body.innerText.trim().length : 0") {
        [weak self] result, error in
        guard let self, !self.didEncounterFailure else {
          return
        }

        if let error {
          self.handleFailure(
            message:
              "OpenStore finished loading without readable content. Start the local web server or override OPENSTORE_BASE_URL, then retry. \(error.localizedDescription)"
          )
          return
        }

        let textLength = (result as? NSNumber)?.intValue ?? 0

        if textLength == 0 {
          self.handleFailure(
            message:
              "OpenStore finished loading a blank page. Start the local web server or override OPENSTORE_BASE_URL, then retry."
          )
          return
        }

        self.loadState = .loaded
      }
    }

    private func cancelTimeout() {
      timeoutWorkItem?.cancel()
      timeoutWorkItem = nil
    }
  }
}

private struct FailureCard: View {
  let title: String
  let message: String
  let urlString: String
  let retry: (() -> Void)?

  var body: some View {
    VStack(spacing: 14) {
      Image(systemName: "wifi.exclamationmark")
        .font(.system(size: 28, weight: .semibold))
        .foregroundStyle(Color.accentColor)

      Text(title)
        .font(.title3.weight(.semibold))
        .multilineTextAlignment(.center)

      Text(message)
        .font(.body)
        .foregroundStyle(.secondary)
        .multilineTextAlignment(.center)

      Text(urlString)
        .font(.footnote.monospaced())
        .foregroundStyle(.secondary)
        .multilineTextAlignment(.center)
        .textSelection(.enabled)

      if let retry {
        Button("Retry", action: retry)
          .buttonStyle(.borderedProminent)
      }
    }
    .frame(maxWidth: 460)
    .padding(24)
    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
    .shadow(color: Color.black.opacity(0.08), radius: 24, x: 0, y: 12)
  }
}
