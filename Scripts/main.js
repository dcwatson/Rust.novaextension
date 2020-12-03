var langserver = null;

exports.activate = function() {
    langserver = new RustLanguageServer();
}

exports.deactivate = function() {
    if (langserver) {
        langserver.deactivate();
        langserver = null;
    }
}


class RustLanguageServer {
    constructor() {
        // Observe the configuration setting for the server's location, and restart the server on change
        nova.config.observe('rust.language-server-path', function(path) {
            this.start(path);
        }, this);
    }
    
    deactivate() {
        this.stop();
    }
    
    start(path) {
        if (this.languageClient) {
            this.languageClient.stop();
            nova.subscriptions.remove(this.languageClient);
        }
        
        // Use the default server path
        if (!path) {
            path = nova.path.expanduser('~/.cargo/bin/rls');
        }
        
        // Create the client
        var serverOptions = {
            path: path
        };
        var clientOptions = {
            // The set of document syntaxes for which the server is valid
            syntaxes: ['rust']
        };
        var client = new LanguageClient('rust-langserver', 'Rust Language Server', serverOptions, clientOptions);
        
        try {
            // Start the client
            client.start();
            
            // Add the client to the subscriptions to be cleaned up
            nova.subscriptions.add(client);
            this.languageClient = client;
        }
        catch (err) {
            // If the .start() method throws, it's likely because the path to the language server is invalid
            
            if (nova.inDevMode()) {
                console.error(err);
            }
        }
    }
    
    stop() {
        if (this.languageClient) {
            this.languageClient.stop();
            nova.subscriptions.remove(this.languageClient);
            this.languageClient = null;
        }
    }
}
