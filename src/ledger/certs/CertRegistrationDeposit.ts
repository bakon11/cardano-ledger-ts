import { Cbor, CborArray, CborObj, CborString, CborUInt } from "@harmoniclabs/cbor";
import { Credential } from "../../credentials"
import { roDescr } from "../../utils/roDescr";
import { CertificateType, certTypeToString } from "./CertificateType"
import { ICert } from "./ICert"
import { Coin } from "../Coin";
import { forceBigUInt } from "../../utils/ints";

export interface ICertRegistrationDeposit {
    stakeCredential: Credential,
    deposit: Coin
}

export class CertRegistrationDeposit
    implements ICert, ICertRegistrationDeposit
{
    readonly certType: CertificateType.RegistrationDeposit;
    readonly stakeCredential: Credential;
    readonly deposit: bigint;

    constructor({ stakeCredential, deposit }: ICertRegistrationDeposit)
    {
        Object.defineProperties(
            this, {
                certType: { value: CertificateType.RegistrationDeposit, ...roDescr },
                stakeCredential: { value: stakeCredential, ...roDescr },
                deposit: { value: forceBigUInt( deposit ), ...roDescr }
            }
        );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.certType ),
            this.stakeCredential.toCborObj(),
            new CborUInt( this.deposit )
        ]);
    }

    static fromCborObj( cbor: CborObj ): CertRegistrationDeposit
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === CertificateType.RegistrationDeposit &&

            cbor.array[2] instanceof CborUInt
        )) throw new Error("Invalid cbor for 'CertRegistrationDeposit'");

        return new CertRegistrationDeposit({
            stakeCredential: Credential.fromCborObj( cbor.array[1] ),
            deposit: cbor.array[2].num
        });
    }

    toJson()
    {
        return {
            certType: certTypeToString( this.certType ),
            stakeCredential: this.stakeCredential.toJson(),
            deposit: this.deposit.toString() 
        }
    }
}