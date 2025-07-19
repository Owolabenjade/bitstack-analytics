;; BitStack Analytics Portfolio Tracker Contract
;; Stores portfolio metadata and basic portfolio information on-chain

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-PORTFOLIO-NOT-FOUND (err u404))
(define-constant ERR-INVALID-PARAMETERS (err u400))
(define-constant ERR-PORTFOLIO-EXISTS (err u409))

;; Data structures
(define-map portfolios
  { owner: principal, portfolio-id: (string-ascii 64) }
  {
    name: (string-utf8 128),
    description: (string-utf8 256),
    created-at: uint,
    updated-at: uint,
    asset-count: uint,
    is-public: bool
  }
)

(define-map portfolio-assets
  { owner: principal, portfolio-id: (string-ascii 64), asset-id: (string-ascii 32) }
  {
    symbol: (string-ascii 16),
    amount: uint,
    average-price: uint,
    added-at: uint
  }
)

(define-map user-portfolio-count
  { owner: principal }
  { count: uint }
)

;; Read-only functions
(define-read-only (get-portfolio (owner principal) (portfolio-id (string-ascii 64)))
  (map-get? portfolios { owner: owner, portfolio-id: portfolio-id })
)

(define-read-only (get-portfolio-asset (owner principal) (portfolio-id (string-ascii 64)) (asset-id (string-ascii 32)))
  (map-get? portfolio-assets { owner: owner, portfolio-id: portfolio-id, asset-id: asset-id })
)

(define-read-only (get-user-portfolio-count (owner principal))
  (default-to { count: u0 } (map-get? user-portfolio-count { owner: owner }))
)

(define-read-only (portfolio-exists (owner principal) (portfolio-id (string-ascii 64)))
  (is-some (map-get? portfolios { owner: owner, portfolio-id: portfolio-id }))
)

;; Public functions
(define-public (create-portfolio 
  (portfolio-id (string-ascii 64)) 
  (name (string-utf8 128)) 
  (description (string-utf8 256))
  (is-public bool))
  (let ((owner tx-sender)
        (current-count (get count (get-user-portfolio-count tx-sender))))
    ;; Check if portfolio already exists
    (asserts! (not (portfolio-exists owner portfolio-id)) ERR-PORTFOLIO-EXISTS)
    
    ;; Validate inputs
    (asserts! (> (len name) u0) ERR-INVALID-PARAMETERS)
    (asserts! (> (len portfolio-id) u0) ERR-INVALID-PARAMETERS)
    
    ;; Create portfolio
    (map-set portfolios
      { owner: owner, portfolio-id: portfolio-id }
      {
        name: name,
        description: description,
        created-at: block-height,
        updated-at: block-height,
        asset-count: u0,
        is-public: is-public
      }
    )
    
    ;; Update user portfolio count
    (map-set user-portfolio-count
      { owner: owner }
      { count: (+ current-count u1) }
    )
    
    (ok portfolio-id)
  )
)

(define-public (add-asset-to-portfolio
  (portfolio-id (string-ascii 64))
  (asset-id (string-ascii 32))
  (symbol (string-ascii 16))
  (amount uint)
  (average-price uint))
  (let ((owner tx-sender)
        (portfolio-data (unwrap! (get-portfolio owner portfolio-id) ERR-PORTFOLIO-NOT-FOUND)))
    
    ;; Validate inputs
    (asserts! (> amount u0) ERR-INVALID-PARAMETERS)
    (asserts! (> average-price u0) ERR-INVALID-PARAMETERS)
    (asserts! (> (len symbol) u0) ERR-INVALID-PARAMETERS)
    
    ;; Add asset to portfolio
    (map-set portfolio-assets
      { owner: owner, portfolio-id: portfolio-id, asset-id: asset-id }
      {
        symbol: symbol,
        amount: amount,
        average-price: average-price,
        added-at: block-height
      }
    )
    
    ;; Update portfolio metadata
    (map-set portfolios
      { owner: owner, portfolio-id: portfolio-id }
      (merge portfolio-data { 
        updated-at: block-height,
        asset-count: (+ (get asset-count portfolio-data) u1)
      })
    )
    
    (ok asset-id)
  )
)

(define-public (update-asset-amount
  (portfolio-id (string-ascii 64))
  (asset-id (string-ascii 32))
  (new-amount uint))
  (let ((owner tx-sender)
        (asset-data (unwrap! (get-portfolio-asset owner portfolio-id asset-id) ERR-PORTFOLIO-NOT-FOUND)))
    
    ;; Validate inputs
    (asserts! (> new-amount u0) ERR-INVALID-PARAMETERS)
    
    ;; Update asset amount
    (map-set portfolio-assets
      { owner: owner, portfolio-id: portfolio-id, asset-id: asset-id }
      (merge asset-data { amount: new-amount })
    )
    
    (ok new-amount)
  )
)

(define-public (remove-asset-from-portfolio
  (portfolio-id (string-ascii 64))
  (asset-id (string-ascii 32)))
  (let ((owner tx-sender)
        (portfolio-data (unwrap! (get-portfolio owner portfolio-id) ERR-PORTFOLIO-NOT-FOUND)))
    
    ;; Check if asset exists
    (asserts! (is-some (get-portfolio-asset owner portfolio-id asset-id)) ERR-PORTFOLIO-NOT-FOUND)
    
    ;; Remove asset
    (map-delete portfolio-assets { owner: owner, portfolio-id: portfolio-id, asset-id: asset-id })
    
    ;; Update portfolio asset count
    (map-set portfolios
      { owner: owner, portfolio-id: portfolio-id }
      (merge portfolio-data { 
        updated-at: block-height,
        asset-count: (- (get asset-count portfolio-data) u1)
      })
    )
    
    (ok asset-id)
  )
)

(define-public (update-portfolio-info
  (portfolio-id (string-ascii 64))
  (name (string-utf8 128))
  (description (string-utf8 256))
  (is-public bool))
  (let ((owner tx-sender)
        (portfolio-data (unwrap! (get-portfolio owner portfolio-id) ERR-PORTFOLIO-NOT-FOUND)))
    
    ;; Validate inputs
    (asserts! (> (len name) u0) ERR-INVALID-PARAMETERS)
    
    ;; Update portfolio info
    (map-set portfolios
      { owner: owner, portfolio-id: portfolio-id }
      (merge portfolio-data {
        name: name,
        description: description,
        is-public: is-public,
        updated-at: block-height
      })
    )
    
    (ok portfolio-id)
  )
)
