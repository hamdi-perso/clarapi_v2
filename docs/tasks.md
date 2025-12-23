# Tasks clarapi

- Setup projet
- Main layout (topbar + sidebar + mainLayout)
- Authentication (signup / login / logout) + user profile
- AI and keys user (Indexdb)
- Import + validation + normalisation + sidebar
- Chat et reception des intents
- Intent markdown
- Intent Endpoint selector 
- Intent NeedMoreinfo
- Intent endpoint execution + result display

## Setup projet
- Create next + Tauri app
```markdown
### Prompt
Role : Developpeur front nextjs + tauri
Action : Crée une application nextjs + tauri vide qui se lance en local dans les deux platefomormes (web + desktop), se build et se package correctement

Voici quelques commandes utils 



### Plan
☐ Install Tauri CLI dependency                                                                                                                                                                                                   
☐ Initialize Tauri in the project                                                                                                                                                                                                
☐ Configure Next.js for static export                                                                                                                                                                                            
☐ Update package.json scripts                                                                                                                                                                                                    
☐ Configure Tauri settings                                                                                                                                                                                                       
☐ Update .gitignore for Tauri


### Modifications effectuées:

1. Tauri CLI installé                                                                                                                                                                                                            
   - Ajouté @tauri-apps/cli@^2.9.6 dans devDependencies
2. Next.js configuré pour Tauri (next.config.ts:4-7)                                                                                                                                                                             
   - output: 'export' pour génération statique                                                                                                                                                                                    
   - images.unoptimized: true pour compatibilité Tauri
3. Tauri initialisé                                                                                                                                                                                                              
   - Structure /src-tauri créée avec:
    - Cargo.toml (config Rust)
    - tauri.conf.json (config Tauri)
    - src/main.rs (code Rust)
    - icons/ (icônes multi-plateformes)
4. Scripts npm ajoutés (package.json:10-12)                                                                                                                                                                                      
   - npm run tauri - CLI Tauri                                                                                                                                                                                                    
   - npm run tauri:dev - Mode développement (ouvre l'app desktop)                                                                                                                                                                 
   - npm run tauri:build - Build production
5. Configuration Tauri (src-tauri/tauri.conf.json:5)                                                                                                                                                                             
   - identifier: com.clarapi.v2                                                                                                                                                                                                   
   - Window: 800x600, resizable                                                                                                                                                                                                   
   - devUrl: http://localhost:3000                                                                                                                                                                                                
   - frontendDist: ../out
6. Gitignore mis à jour (.gitignore:44)                                                                                                                                                                                          
   - Ajouté /src-tauri/target (build artifacts Rust)

Pour tester:
- npm run tauri:dev - Lance Next.js + ouvre l'app Tauri
- npm run tauri:build - Crée l'exécutable natif

Le projet est maintenant compatible Tauri! 
```












- Main layout (topbar + sidebar + mainLayout)
- AI and keys user (Indexdb)
- Import + validation + normalisation + sidebar
- Chat et reception des intents
- Intent markdown
- Intent Endpoint selector
- Intent NeedMoreinfo
- Intent endpoint execution + result display
