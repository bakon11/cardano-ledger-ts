
import { ToCbor, CborString, Cbor, CborObj, CborArray, CanBeCborString, forceCborString, SubCborRef } from "@harmoniclabs/cbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { Hash32 } from "../../../hashes/Hash32/Hash32";
import { Signature } from "../../../hashes/Signature";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";
import { VKey } from "./VKey";
import { assert } from "../../../utils/assert";
import { getSubCborRef } from "../../../utils/getSubCborRef";

export class VKeyWitness
    implements ToCbor, Cloneable<VKeyWitness>, ToJson
{
    readonly vkey!: VKey
    readonly signature!: Signature

    constructor(
        vkey: Hash32,
        signature: Signature,
        readonly subCborRef?: SubCborRef
    )
    {
        assert(
            vkey instanceof Hash32,
            "can't construct 'VKeyWitness' without a 'VKey' as first argument"
        );
        defineReadOnlyProperty(
            this,
            "vkey",
            vkey
        );

        assert(
            signature instanceof Signature,
            "can't construct 'VKeyWitness' without a 'Signature' as second argument"
        );
        defineReadOnlyProperty(
            this,
            "signature",
            signature
        );
    }

    clone(): VKeyWitness
    {
        return new VKeyWitness(
            new VKey( this.vkey ),
            new Signature( this.signature )
        )
    }
    
    toCbor(): CborString
    {
        if( this.subCborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return new CborString( this.subCborRef.toBuffer() );
        }
        
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        if( this.subCborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse( this.subCborRef.toBuffer() );
        }
        return new CborArray([
            this.vkey.toCborObj(),
            this.signature.toCborObj()
        ])
    }

    static fromCbor( cStr: CanBeCborString ): VKeyWitness
    {
        return VKeyWitness.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    static fromCborObj( cObj: CborObj ): VKeyWitness
    {
        if(!(cObj instanceof CborArray))
        throw new InvalidCborFormatError("VKeyWitness");

        return new VKeyWitness(
            Hash32.fromCborObj( cObj.array[0] ),
            Signature.fromCborObj( cObj.array[1] ),
            getSubCborRef( cObj )
        );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            vkey: this.vkey.asString,
            signature: this.signature.asString
        }
    }
}