/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at:
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mozilla Raindrop Code.
 *
 * The Initial Developer of the Original Code is
 *   The Mozilla Foundation
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Andrew Sutherland <asutherland@asutherland.org>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * Management for (private) crypto keys.  Ideally, all (non-ephemeral) private
 *  key handling associated with people goes through here so we can avoid
 *  passing private keys around or exposing them at all.  The kind of deal where
 *  we could support hardware that allows us to use the keys in operations
 *  without ever being able to directly get at the key.
 *
 * This module is just trying to structure things sanely; all crypto ops still
 *  happen in `keyops.js`.
 *
 * NOTE: We are not currently trying to defend against rogue code in the same
 *  sandbox as us.  We are not using lexical closures to hide variables, etc.
 **/

define(
  [
    './keyops',
    'exports'
  ],
  function(
    $keyops,
    exports
  ) {

const RINGAUTH_ROOT = 'root';
/**
 * A keyring with a longterm authorized key for an identity.
 */
const RINGAUTH_LONGTERM = 'longterm';
/**
 * A keyring with some delegated authority from an identity.
 */
const RINGAUTH_DELEGATED = 'delegated';

const RINGTYPE_PERSON = 'person';
const RINGTYPE_SERVER = 'server';

const RINGTYPE_BOX = 'box';
const RINGTYPE_SIGN = 'sign';

const VERSION = 1;

/**
 * A keyring for people with the root private keys for an identity.
 *
 * It issues and remembers longterm keyrings, but can't do anything else.
 */
function PersonRootSigningKeyring(persistedForm) {
  if (persistedForm == null) {
    this.data = {
      v: VERSION,
      auth: RINGAUTH_ROOT, type: RINGTYPE_PERSON,
      rootKeypair: $keyops.generateRootSigningKeypair(),
      issuedLongtermSigners: [],
    };
  }
  else {
    this.data = persistedForm;
  }
}
PersonRootSigningKeyring.prototype = {
  toString: function() {
    return '[PersonRootSigningKeyring]';
  },
  toJSON: function() {
    return {
      type: 'PersonRootSigningKeyring',
    };
  },

  get rootPublicKey() {
    return this.data.rootKeypair.publicKey;
  },

  issueLongtermSigningKeyring: function() {
    var now = Date.now();
    var longtermSignBundle = $keyops.generateAndAuthorizeLongtermKeypair(
                               this.data.rootKeypair, 'sign',
                               now, now + $keyops.MAX_AUTH_TIMESPAN);
    this.data.issuedLongtermSigners.push(longtermSignBundle);
    return new LongtermSigningKeyring(
      null,
      {
        rootPublicKey: this.rootPublicKey,
        longtermSignBundle: longtermSignBundle,
      });
  },
};

/**
 * A keyring for people with the root private keys for an identity.
 *
 * It issues and remembers longterm keyrings, but can't do anything else.
 */
function ServerRootSigningKeyring(persistedForm) {
  if (persistedForm == null) {
    this.data = {
      v: VERSION,
      auth: RINGAUTH_ROOT, type: RINGTYPE_SERVER,
      rootKeypair: $keyops.generateRootSigningKeypair(),
      issuedLongtermBoxers: [],
    };
  }
  else {
    this.data = persistedForm;
  }
}
ServerRootSigningKeyring.prototype = {
  toString: function() {
    return '[ServerRootSigningKeyring]';
  },
  toJSON: function() {
    return {
      type: 'ServerRootSigningKeyring',
    };
  },

  get rootPublicKey() {
    return this.data.rootKeypair.publicKey;
  },

  issueLongtermBoxingKeyring: function() {
    var now = Date.now();
    var longtermBoxBundle = $keyops.generateAndAuthorizeLongtermKeypair(
                              this.data.rootKeypair, 'box',
                              now, now + $keyops.MAX_AUTH_TIMESPAN);
    this.data.issuedLongtermBoxers.push(longtermBoxBundle);
    return new LongtermBoxingKeyring(
      null,
      {
        rootPublicKey: this.rootPublicKey,
        longtermBoxBundle: longtermBoxBundle,
      });
  },

  signJsonObj: function(obj) {
    return $keyops.signJsonWithRootKeypair(obj, this.data.rootKeypair);
  },
};


function LongtermBoxingKeyring(persistedForm, creationForm) {
  if (persistedForm == null) {
    if (!creationForm)
      throw new Error("Where is my creationForm?");

    this.data = {
      v: VERSION,
      auth: RINGAUTH_LONGTERM, type: RINGTYPE_BOX,
      rootPublicKey: creationForm.rootPublicKey,
      longtermBoxBundle: creationForm.longtermBoxBundle,
    };
  }
  else {
    this.data = persistedForm;
  }
}
LongtermBoxingKeyring.prototype = {
  toString: function() {
    return '[LongtermBoxingKeyring]';
  },
  toJSON: function() {
    return {
      type: 'LongtermBoxingKeyring',
    };
  },

  get rootPublicKey() {
    return this.data.rootPublicKey;
  },
  get boxingPublicKey() {
    return this.data.longtermBoxBundle.keypair.publicKey;
  },

  box: function(msg, nonce, recipientPubKey) {
    return $keyops.longtermBox(msg, nonce, recipientPubKey,
                               this.data.longtermBoxBundle.keypair);
  },
  boxUtf8: function(msg, nonce, recipientPubKey) {
    return $keyops.longtermBoxUtf8(msg, nonce, recipientPubKey,
                                   this.data.longtermBoxBundle.keypair);
  },
  openBox: function(boxedMessage, nonce, senderPubKey) {
    return $keyops.longtermOpenBox(boxedMessage, nonce, senderPubKey,
                                   this.data.longtermBoxBundle.keypair);
  },
  openBoxUtf8: function(boxedMessage, nonce, senderPubKey) {
    return $keyops.longtermOpenBoxUtf8(boxedMessage, nonce, senderPubKey,
                                       this.data.longtermBoxBundle.keypair);
  },
};

/**
 * A keyring with a longterm authorized key.
 *
 * It is able to issue groups of delegate-authorized keys for use by a
 *  delegated keyring.  All activites with the issued keys need to happen on a
 *  `DelegatedKeyring` and are not provided on this class.  The rationale is
 *  that the longterm key is particularly important and so should be handled
 *  separately for hygiene reasons.
 */
function LongtermSigningKeyring(persistedForm, creationForm) {
  if (persistedForm == null) {
    if (!creationForm)
      throw new Error("Where is my creationForm?");

    this.data = {
      v: VERSION,
      auth: RINGAUTH_LONGTERM, type: RINGTYPE_SIGN,
      rootPublicKey: creationForm.rootPublicKey,
      longtermSignBundle: creationForm.longtermSignBundle,
      issuedGroups: {},
      issuedSecretBoxKeys: {},
      issuedAuthKeys: {},
    };
  }
  else {
    this.data = persistedForm;
  }
}
LongtermSigningKeyring.prototype = {
  toString: function() {
    return '[LongtermSigningKeyring]';
  },
  toJSON: function() {
    return {
      type: 'LongtermSigningKeyring',
    };
  },

  get rootPublicKey() {
    return this.data.rootPublicKey;
  },
  get signingPublicKey() {
    return this.data.longtermSignBundle.keypair.publicKey;
  },
  get authorization() {
    return this.data.longtermSignBundle.authorization;
  },

  /**
   * Create one or more keys (either boxing or signing) as part of a key group
   *  that will be authorized (via longterm key signature) as an atomic group.
   *
   * We will generate and persist a signature that proves we authorized these
   *  keys.  This is primarily done for parties controlled by or acting on the
   *  behalf of the user (including our own sanity-checking of our persisted
   *  store.
   *
   * We may also optionally generate a public attestation.
   */
  issueKeyGroup: function(groupName, keyNamesToTypesMap,
                          formalPublicAuthorizedFor) {
    var groupBundle = $keyops.generateAndAuthorizeKeyGroup(
      this.data.longtermSignBundle.keypair,
      groupName, keyNamesToTypesMap);

    if (formalPublicAuthorizedFor) {
      var keypairCount = 0, authorizingPubKey;
      for (var keypairName in groupBundle.keypairs) {
        if (keypairCount++)
          throw new Error("public attestations are only for singleton keys");
        authorizingPubKey = groupBundle.keypairs[keypairName].publicKey;
      }

      groupBundle.publicAuth = $keyops.generateLongtermBaseKeyAttestation(
        this.data.longtermSignBundle.keypair,
        formalPublicAuthorizedFor, authorizingPubKey);
    }

    var issuedGroups = this.data.issuedGroups;
    if (!issuedGroups.hasOwnProperty(groupName))
      issuedGroups[groupName] = [];
    issuedGroups[groupName].push(groupBundle);

    return groupBundle;
  },

  forgetIssuedGroup: function(groupName) {
    delete this.data.issuedGroups[groupName];
  },

  /**
   * Generate a secretbox key, remember it, and return a representation that
   *  can be provided to a delegated keyring.
   */
  generateSecretBoxKey: function(keyName) {
    var key = $keyops.makeSecretBoxKey();
    var issued = this.data.issuedSecretBoxKeys;
    if (!issued.hasOwnProperty(keyName))
      issued[keyName] = [];
    issued[keyName].push(key);
    return {name: keyName, key: key};
  },

  /**
   * Generate a (secret) authentication key, remember it, and return a
   *  representation that can be provided to a delegated keyring.
   */
  generateAuthKey: function(keyName) {
    var key = $keyops.makeAuthKey();
    var issued = this.data.issuedAuthKeys;
    if (!issued.hasOwnProperty(keyName))
      issued[keyName] = [];
    issued[keyName].push(key);
    return {name: keyName, key: key};
  },

  /**
   * Low-level operation to sign a JSON object with our long-term signing key.
   *  Do not use this willy-nilly, try and use other higher level mechanisms
   *  like attestation generation.
   */
  __signJsonObj: function(obj) {
    return $keyops.signJsonWithLongtermKeypair(
      obj, this.data.longtermSignBundle.keypair);
  },

  makeDelegatedKeyring: function() {
    return new DelegatedKeyring(
      null,
      {
        v: VERSION,
        rootPublicKey: this.rootPublicKey,
        longtermSignPublicKey: this.data.longtermSignBundle.keypair.publicKey,
      });
  },

};

/**
 * A keyring with a bunch of delegated keys, all of which are held on behalf of
 *  a single identity.  This mainly entails posessing one or more groups of
 *  keys which include the keypairs and the group authorization of the keys
 *  signed by a valid longterm keypair for the identity.
 */
function DelegatedKeyring(persistedForm, creationForm) {
  if (persistedForm == null) {
    if (!creationForm)
      throw new Error("Where is my creationForm?");

    this.data = {
      v: VERSION,
      auth: RINGAUTH_DELEGATED,
      rootPublicKey: creationForm.rootPublicKey,
      longtermSignPublicKey: creationForm.longtermSignPublicKey,
      // it seems to me that we should only ever be using one instance of a group
      //  at a time, but that we might know about previous generations or other
      //  sets...
      activeGroups: {},
      activeSecretBoxKeys: {},
      activeAuthKeys: {},
    };
  }
  else {
    this.data = persistedForm;
  }
}
DelegatedKeyring.prototype = {
  toString: function() {
    return '[DelegatedKeyring]';
  },
  toJSON: function() {
    return {
      type: 'DelegatedKeyring',
    };
  },

  get rootPublicKey() {
    return this.data.rootPublicKey;
  },
  get signingPublicKey() {
    return this.data.longtermSignPublicKey;
  },

  _gimmeKeypair: function(groupName, keyName) {
    if (!this.data.activeGroups.hasOwnProperty(groupName))
      throw new Error("No such group: '" + groupName + "'");
    var bundle = this.data.activeGroups[groupName];
    if (!bundle.keypairs.hasOwnProperty(keyName))
      throw new Error("No such key name: '" + keyName + "'");

    return bundle.keypairs[keyName];
  },

  //////////////////////////////////////////////////////////////////////////////
  // Keyring key management

  forgetKeyGroup: function(groupName) {
    delete this.data.activeGroups[groupName];
  },

  incorporateKeyGroup: function(groupBundle) {
    this.data.activeGroups[groupBundle.groupName] = groupBundle;
  },

  incorporateSecretBoxKey: function(secretBoxKeyBundle) {
    this.data.activeSecretBoxKeys[secretBoxKeyBundle.name] =
      secretBoxKeyBundle.key;
  },

  incorporateAuthKey: function(authKeyBundle) {
    this.data.activeAuthKeys[authKeyBundle.name] = authKeyBundle.key;
  },

  /**
   * Export keypair from a group in this keyring to hand it to something acting
   *  as an agent on our behalf.  *This exposes a secret key* so be sure you
   *  don't just intend to expose the public key; use `getPublicKeyFor` or
   *  `getPublicAuthFor` in those cases.
   *
   * This should be passed to `loadSimpleBoxingKeyring` to create a simple
   *  boxing keyring.
   */
  exportKeypairForAgentUse: function(groupName, keyName) {
    var keypair = this._gimmeKeypair(groupName, keyName);
    return {
      rootPublicKey: this.rootPublicKey,
      keypair: keypair,
    };
  },

  //////////////////////////////////////////////////////////////////////////////
  // Key lookup

  getPublicKeyFor: function(groupName, keyName) {
    return this._gimmeKeypair(groupName, keyName).publicKey;
  },

  getPublicAuthFor: function(groupName) {
    if (!this.data.activeGroups.hasOwnProperty(groupName))
      throw new Error("No such group: '" + groupName + "'");
    var bundle = this.data.activeGroups[groupName];
    if (!bundle.publicAuth)
      throw new Error("No public authorization for group: '" + groupName + "'");
    return bundle.publicAuth;
  },

  //////////////////////////////////////////////////////////////////////////////
  // Signature Operations
  //
  // note that verification does not need a private key, and so is not covered
  //  here, although we may change that up.

  signWith: function(msg, groupName, keyName) {
    return $keyops.generalSign(msg, this._gimmeKeypair(groupName, keyName));
  },

  signUtf8With: function(msg, groupName, keyName) {
    return $keyops.generalSignUtf8(msg, this._gimmeKeypair(groupName, keyName));
  },

  //////////////////////////////////////////////////////////////////////////////
  // Box Operations


  boxWith: function(msg, nonce, recipientKey,
                    groupName, keyName) {
    return $keyops.generalBox(msg, nonce, recipientKey,
                              this._gimmeKeypair(groupName, keyName));
  },
  boxUtf8With: function(msg, nonce, recipientKey,
                        groupName, keyName) {
    return $keyops.generalBoxUtf8(msg, nonce, recipientKey,
                                  this._gimmeKeypair(groupName, keyName));
  },

  openBoxWith: function(boxedMessage, nonce, senderKey,
                        groupName, keyName) {
    return $keyops.generalOpenBox(boxedMessage, nonce, senderKey,
                                  this._gimmeKeypair(groupName, keyName));
  },
  openBoxUtf8With: function(boxedMessage, nonce, senderKey,
                        groupName, keyName) {
    return $keyops.generalOpenBoxUtf8(boxedMessage, nonce, senderKey,
                                      this._gimmeKeypair(groupName, keyName));
  },

  //////////////////////////////////////////////////////////////////////////////
  // SecretBox Operations

  secretBoxWith: function(msg, nonce, keyName) {
    var keymap = this.data.activeSecretBoxKeys;
    if (!keymap.hasOwnProperty(keyName))
      throw new Error("No secret box key with name '" + keyName + "'");
    return $keyops.secretBox(msg, nonce, keymap[keyName]);
  },

  secretBoxUtf8With: function(msg, nonce, keyName) {
    var keymap = this.data.activeSecretBoxKeys;
    if (!keymap.hasOwnProperty(keyName))
      throw new Error("No secret box key with name '" + keyName + "'");
    return $keyops.secretBoxUtf8(msg, nonce, keymap[keyName]);
  },


  openSecretBoxWith: function(sboxed, nonce, keyName) {
    var keymap = this.data.activeSecretBoxKeys;
    if (!keymap.hasOwnProperty(keyName))
      throw new Error("No secret box key with name '" + keyName + "'");
    return $keyops.secretBoxOpen(sboxed, nonce, keymap[keyName]);
  },

  openSecretBoxUtf8With: function(sboxed, nonce, keyName) {
    var keymap = this.data.activeSecretBoxKeys;
    if (!keymap.hasOwnProperty(keyName))
      throw new Error("No secret box key with name '" + keyName + "'");
    return $keyops.secretBoxOpenUtf8(sboxed, nonce, keymap[keyName]);
  },


  //////////////////////////////////////////////////////////////////////////////
  // Auth Operations

  authWith: function(msg, keyName) {
    var keymap = this.data.activeAuthKeys;
    if (!keymap.hasOwnProperty(keyName))
      throw new Error("No auth key with name '" + keyName + "'");
    return $keyops.auth(msg, keymap[keyName]);
  },

  authUtf8With: function(msg, keyName) {
    var keymap = this.data.activeAuthKeys;
    if (!keymap.hasOwnProperty(keyName))
      throw new Error("No auth key with name '" + keyName + "'");
    return $keyops.authUtf8(msg, keymap[keyName]);
  },


  verifyAuthWith: function(auth, msg, keyName) {
    var keymap = this.data.activeAuthKeys;
    if (!keymap.hasOwnProperty(keyName))
      throw new Error("No auth key with name '" + keyName + "'");
    return $keyops.authVerify(auth, msg, keymap[keyName]);
  },

  verifyAuthUtf8With: function(auth, msg, keyName) {
    var keymap = this.data.activeAuthKeys;
    if (!keymap.hasOwnProperty(keyName))
      throw new Error("No auth key with name '" + keyName + "'");
    return $keyops.authVerifyUtf8(auth, msg, keymap[keyName]);
  },

  //////////////////////////////////////////////////////////////////////////////
  // Convenience Helpers

  /**
   * Expose a specific keypair as a simple boxing keyring with box/openBox
   *  variants.
   */
  exposeSimpleBoxingKeyringFor: function(groupName, keyName) {
    return new ExposedSimpleBoxingKeyring(
      this.rootPublicKey, this._gimmeKeypair(groupName, keyName));
  },

  //////////////////////////////////////////////////////////////////////////////
};

function ExposedSimpleBoxingKeyring(rootPublicKey, keypair) {
  this.rootPublicKey = rootPublicKey;
  this._keypair = keypair;
}
ExposedSimpleBoxingKeyring.prototype = {
  toString: function() {
    return '[ExposedSimpleBoxingKeyring]';
  },
  toJSON: function() {
    return {
      type: 'ExposedSimpleBoxingKeyring',
    };
  },

  get boxingPublicKey() {
    return this._keypair.publicKey;
  },

  box: function(msg, nonce, recipientPubKey) {
    return $keyops.generalBox(msg, nonce, recipientPubKey, this._keypair);
  },
  boxUtf8: function(msg, nonce, recipientPubKey) {
    return $keyops.generalBoxUtf8(msg, nonce, recipientPubKey, this._keypair);
  },
  openBox: function(boxedMessage, nonce, senderPubKey) {
    return $keyops.generalOpenBox(boxedMessage, nonce, senderPubKey,
                                  this._keypair);
  },
  openBoxUtf8: function(boxedMessage, nonce, senderPubKey) {
    return $keyops.generalOpenBoxUtf8(boxedMessage, nonce, senderPubKey,
                                      this._keypair);
  },
};

/**
 * Create a completely new person identity with its own keyring.
 */
exports.createNewPersonRootKeyring = function() {
  return new PersonRootSigningKeyring();
};

exports.loadPersonRootSigningKeyring = function(persistedForm) {
  return new PersonRootSigningKeyring(persistedForm);
};

exports.loadLongtermBoxingKeyring = function(persistedForm) {
  return new LongtermBoxingKeyring(persistedForm);
};

exports.loadLongtermSigningKeyring = function(persistedForm) {
  return new LongtermSigningKeyring(persistedForm);
};

exports.loadDelegatedKeyring = function(persistedForm) {
  return new DelegatedKeyring(persistedForm);
};

exports.createNewServerRootKeyring = function() {
  return new ServerRootSigningKeyring();
};

exports.loadServerRootKeyring = function(persistedForm) {
  return new ServerRootSigningKeyring(persistedForm);
};

exports.loadSimpleBoxingKeyring = function(persistedForm) {
  return new ExposedSimpleBoxingKeyring(persistedForm.rootPublicKey,
                                        persistedForm.keypair);
};

}); // end define
