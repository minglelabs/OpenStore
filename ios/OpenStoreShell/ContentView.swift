import SwiftUI
import WebKit

struct ContentView: View {
  @State private var isLoading = true

  var body: some View {
    ZStack(alignment: .top) {
      WebContainerView(url: AppConfiguration.baseURL, isLoading: $isLoading)
        .ignoresSafeArea()

      if isLoading {
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
    }
  }
}

private enum AppConfiguration {
  static let baseURL: URL = {
    let infoURL =
      Bundle.main.object(forInfoDictionaryKey: "OpenStoreBaseURL") as? String
    let rawURL = infoURL ?? "http://localhost:3000/today"
    return URL(string: rawURL) ?? URL(string: "http://localhost:3000/today")!
  }()
}

private struct WebContainerView: UIViewRepresentable {
  let url: URL
  @Binding var isLoading: Bool

  func makeCoordinator() -> Coordinator {
    Coordinator(isLoading: $isLoading)
  }

  func makeUIView(context: Context) -> WKWebView {
    let configuration = WKWebViewConfiguration()
    let webView = WKWebView(frame: .zero, configuration: configuration)

    webView.navigationDelegate = context.coordinator
    webView.allowsBackForwardNavigationGestures = true
    webView.scrollView.contentInsetAdjustmentBehavior = .never
    webView.load(URLRequest(url: url))

    return webView
  }

  func updateUIView(_ webView: WKWebView, context: Context) {
    guard webView.url == nil else {
      return
    }

    webView.load(URLRequest(url: url))
  }

  final class Coordinator: NSObject, WKNavigationDelegate {
    @Binding private var isLoading: Bool

    init(isLoading: Binding<Bool>) {
      _isLoading = isLoading
    }

    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
      isLoading = true
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
      isLoading = false
    }

    func webView(
      _ webView: WKWebView,
      didFail navigation: WKNavigation!,
      withError error: Error,
    ) {
      isLoading = false
    }

    func webView(
      _ webView: WKWebView,
      didFailProvisionalNavigation navigation: WKNavigation!,
      withError error: Error,
    ) {
      isLoading = false
    }
  }
}
